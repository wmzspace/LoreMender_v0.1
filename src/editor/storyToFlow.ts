/**
 * 将 STORY 数据转为 React Flow 的节点和边
 */
import type { Node, Edge } from '@xyflow/react';
import type { StoryChapter, Beat, Choice } from '../data/types';

export type NodeKind = 'chapter' | 'narration' | 'dialogue' | 'choice' | 'goto' | 'ending';

export interface ChapterNodeData extends Record<string, unknown> {
  kind: 'chapter';
  chapterId: string;
  title: string;
  scene: string;
}

export interface NarrationNodeData extends Record<string, unknown> {
  kind: 'narration';
  chapterId: string;
  beatIndex: number;
  line: string;
}

export interface DialogueNodeData extends Record<string, unknown> {
  kind: 'dialogue';
  chapterId: string;
  beatIndex: number;
  speaker: string;
  line: string;
}

export interface ChoiceNodeData extends Record<string, unknown> {
  kind: 'choice';
  chapterId: string;
  beatIndex: number;
  choices: Choice[];
}

export interface GotoNodeData extends Record<string, unknown> {
  kind: 'goto';
  chapterId: string;
  beatIndex: number;
  target: string; // 'ch1','ch2','clue','trust','ending'
}

export interface EndingNodeData extends Record<string, unknown> {
  kind: 'ending';
  endingId: string;
  name: string;
  rank: string;
  body: string;
}

export type StoryNodeData =
  | ChapterNodeData
  | NarrationNodeData
  | DialogueNodeData
  | ChoiceNodeData
  | GotoNodeData
  | EndingNodeData;

const CHAPTER_COLORS: Record<string, string> = {
  ch1: '#5c3a1e',
  ch2: '#1e3a5c',
  ch3: '#1e5c3a',
  ch4: '#5c1e3a',
};

const X_GAP = 340;
const Y_GAP = 120;
const CHAPTER_X_OFFSET = 100;

export function storyToFlow(
  story: Record<string, StoryChapter>
): { nodes: Node<StoryNodeData>[]; edges: Edge[] } {
  const nodes: Node<StoryNodeData>[] = [];
  const edges: Edge[] = [];

  let chapterCol = 0;

  Object.entries(story).forEach(([chapterId, chapter]) => {
    const baseX = CHAPTER_X_OFFSET + chapterCol * (X_GAP * 2.5);
    chapterCol++;

    // 章节标题节点
    const chapterNodeId = `ch_${chapterId}`;
    nodes.push({
      id: chapterNodeId,
      type: 'chapterNode',
      position: { x: baseX, y: 40 },
      data: {
        kind: 'chapter',
        chapterId,
        title: chapter.title,
        scene: chapter.scene,
      } as ChapterNodeData,
    });

    let prevNodeId = chapterNodeId;
    let yPos = 40 + Y_GAP * 2;

    chapter.beats.forEach((beat, beatIndex) => {
      const nodeId = `${chapterId}_beat_${beatIndex}`;

      if ('narration' in beat && beat.narration) {
        nodes.push({
          id: nodeId,
          type: 'narrationNode',
          position: { x: baseX, y: yPos },
          data: {
            kind: 'narration',
            chapterId,
            beatIndex,
            line: beat.line,
          } as NarrationNodeData,
        });
        edges.push({ id: `e_${prevNodeId}_${nodeId}`, source: prevNodeId, target: nodeId, type: 'smoothstep' });
        prevNodeId = nodeId;
        yPos += Y_GAP;

      } else if ('speaker' in beat) {
        nodes.push({
          id: nodeId,
          type: 'dialogueNode',
          position: { x: baseX, y: yPos },
          data: {
            kind: 'dialogue',
            chapterId,
            beatIndex,
            speaker: beat.speaker,
            line: beat.line,
          } as DialogueNodeData,
        });
        edges.push({ id: `e_${prevNodeId}_${nodeId}`, source: prevNodeId, target: nodeId, type: 'smoothstep' });
        prevNodeId = nodeId;
        yPos += Y_GAP;

      } else if ('choices' in beat) {
        nodes.push({
          id: nodeId,
          type: 'choiceNode',
          position: { x: baseX, y: yPos },
          data: {
            kind: 'choice',
            chapterId,
            beatIndex,
            choices: beat.choices,
          } as ChoiceNodeData,
        });
        edges.push({ id: `e_${prevNodeId}_${nodeId}`, source: prevNodeId, target: nodeId, type: 'smoothstep' });
        prevNodeId = nodeId;
        yPos += Y_GAP * (beat.choices.length + 1);

      } else if ('gotoChapter' in beat || 'gotoTrust' in beat || 'gotoEnding' in beat) {
        const target = 'gotoChapter' in beat ? beat.gotoChapter
          : 'gotoTrust' in beat ? 'trust'
          : 'ending';

        nodes.push({
          id: nodeId,
          type: 'gotoNode',
          position: { x: baseX, y: yPos },
          data: {
            kind: 'goto',
            chapterId,
            beatIndex,
            target,
          } as GotoNodeData,
        });
        edges.push({ id: `e_${prevNodeId}_${nodeId}`, source: prevNodeId, target: nodeId, type: 'smoothstep' });
        prevNodeId = nodeId;
        yPos += Y_GAP;
      }
    });
  });

  return { nodes, edges };
}

/**
 * 将编辑器中的节点数组转回 STORY 数据结构
 */
export function flowToStory(
  nodes: Node<StoryNodeData>[],
  edges: Edge[]
): Record<string, StoryChapter> {
  const story: Record<string, StoryChapter> = {};

  // 收集所有章节节点
  const chapterNodes = nodes.filter(n => n.data.kind === 'chapter') as Node<ChapterNodeData>[];

  chapterNodes.forEach(chNode => {
    const chapterId = chNode.data.chapterId;

    // 获取该章节的所有 beat 节点（按 beatIndex 排序）
    const beatNodes = nodes
      .filter(n =>
        n.data.kind !== 'chapter' && n.data.kind !== 'ending' &&
        (n.data as any).chapterId === chapterId
      )
      .sort((a, b) => ((a.data as any).beatIndex ?? 0) - ((b.data as any).beatIndex ?? 0));

    const beats: Beat[] = beatNodes.map(n => {
      const d = n.data;
      if (d.kind === 'narration') return { narration: true, line: d.line };
      if (d.kind === 'dialogue') return { speaker: d.speaker, line: d.line };
      if (d.kind === 'choice') return { choices: d.choices };
      if (d.kind === 'goto') {
        if (d.target === 'trust') return { gotoTrust: true };
        if (d.target === 'ending') return { gotoEnding: true };
        return { gotoChapter: d.target };
      }
      return { narration: true, line: '' };
    });

    story[chapterId] = {
      scene: chNode.data.scene as any,
      title: chNode.data.title,
      beats,
    };
  });

  return story;
}

/**
 * 将 STORY 数据序列化为 story.ts 文件内容
 */
export function storyToTypeScript(story: Record<string, StoryChapter>): string {
  const lines: string[] = [
    `import type { StoryChapter } from "./types";`,
    ``,
    `export const STORY: Record<string, StoryChapter> = {`,
  ];

  Object.entries(story).forEach(([chapterId, chapter], ci) => {
    const isLast = ci === Object.keys(story).length - 1;
    lines.push(`  ${chapterId}: {`);
    lines.push(`    scene: "${chapter.scene}",`);
    lines.push(`    title: "${chapter.title}",`);
    lines.push(`    beats: [`);

    chapter.beats.forEach(beat => {
      if ('narration' in beat && beat.narration) {
        lines.push(`      { narration: true, line: ${JSON.stringify(beat.line)} },`);
      } else if ('speaker' in beat) {
        lines.push(`      { speaker: ${JSON.stringify(beat.speaker)}, line: ${JSON.stringify(beat.line)} },`);
      } else if ('choices' in beat) {
        lines.push(`      {`);
        lines.push(`        choices: [`);
        beat.choices.forEach(c => {
          const parts: string[] = [`label: ${JSON.stringify(c.label)}`];
          if (c.toast) parts.push(`toast: ${JSON.stringify(c.toast)}`);
          if (c.set && Object.keys(c.set).length > 0) {
            const setStr = Object.entries(c.set)
              .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
              .join(', ');
            parts.push(`set: { ${setStr} }`);
          }
          if (c.ending) parts.push(`ending: "${c.ending}"`);
          lines.push(`          { ${parts.join(', ')} },`);
        });
        lines.push(`        ],`);
        lines.push(`      },`);
      } else if ('gotoChapter' in beat) {
        lines.push(`      { gotoChapter: "${beat.gotoChapter}" },`);
      } else if ('gotoTrust' in beat) {
        lines.push(`      { gotoTrust: true },`);
      } else if ('gotoEnding' in beat) {
        lines.push(`      { gotoEnding: true },`);
      }
    });

    lines.push(`    ],`);
    lines.push(`  }${isLast ? '' : ','},`);
  });

  lines.push(`};`);
  lines.push(``);
  return lines.join('\n');
}
