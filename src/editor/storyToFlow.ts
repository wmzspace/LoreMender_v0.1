/**
 * 将 STORY 数据转为 React Flow 的节点和边
 * 改动：连续对白 beats 合并为一个 DialogueBlockNode
 */
import type { Node, Edge } from '@xyflow/react';
import type { StoryChapter, Beat, Choice } from '../data/types';

export type NodeKind = 'chapter' | 'narration' | 'dialogueBlock' | 'choice' | 'goto' | 'ending';

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

/** 一个对话块节点 = 多条连续对白 */
export interface DialogueLine {
  speaker: string;
  line: string;
}
export interface DialogueBlockNodeData extends Record<string, unknown> {
  kind: 'dialogueBlock';
  chapterId: string;
  beatIndex: number;       // 该块起始 beat 索引
  lines: DialogueLine[];   // 所有对白行
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
  target: string;
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
  | DialogueBlockNodeData
  | ChoiceNodeData
  | GotoNodeData
  | EndingNodeData;

const Y_GAP = 130;

/** 把原始 beats 数组中连续的 speaker beats 合并为块 */
function mergeBeats(beats: Beat[]): Array<{ beat: Beat; origIndex: number }[]> {
  const groups: Array<{ beat: Beat; origIndex: number }[]> = [];
  let i = 0;
  while (i < beats.length) {
    const beat = beats[i];
    if ('speaker' in beat) {
      // 尝试合并连续对白
      const block: { beat: Beat; origIndex: number }[] = [{ beat, origIndex: i }];
      while (i + 1 < beats.length && 'speaker' in beats[i + 1]) {
        i++;
        block.push({ beat: beats[i], origIndex: i });
      }
      groups.push(block);
    } else {
      groups.push([{ beat, origIndex: i }]);
    }
    i++;
  }
  return groups;
}

export function storyToFlow(
  story: Record<string, StoryChapter>,
  filterChapterId?: string         // 只渲染该章节
): { nodes: Node<StoryNodeData>[]; edges: Edge[] } {
  const nodes: Node<StoryNodeData>[] = [];
  const edges: Edge[] = [];

  const entries = filterChapterId
    ? Object.entries(story).filter(([id]) => id === filterChapterId)
    : Object.entries(story);

  entries.forEach(([chapterId, chapter]) => {
    const baseX = 100;

    const chapterNodeId = `ch_${chapterId}`;
    nodes.push({
      id: chapterNodeId,
      type: 'chapterNode',
      position: { x: baseX, y: 40 },
      data: { kind: 'chapter', chapterId, title: chapter.title, scene: chapter.scene } as ChapterNodeData,
    });

    let prevNodeId = chapterNodeId;
    let yPos = 40 + Y_GAP * 1.5;

    const groups = mergeBeats(chapter.beats);
    groups.forEach((group, groupIndex) => {
      const firstBeat = group[0].beat;
      const firstOrigIndex = group[0].origIndex;
      const nodeId = `${chapterId}_g${groupIndex}`;

      if ('narration' in firstBeat && firstBeat.narration) {
        nodes.push({
          id: nodeId, type: 'narrationNode', position: { x: baseX, y: yPos },
          data: { kind: 'narration', chapterId, beatIndex: firstOrigIndex, line: firstBeat.line } as NarrationNodeData,
        });
        yPos += Y_GAP;

      } else if ('speaker' in firstBeat) {
        // 对话块节点
        const lines: DialogueLine[] = group.map(g => ({
          speaker: (g.beat as any).speaker,
          line: (g.beat as any).line,
        }));
        nodes.push({
          id: nodeId, type: 'dialogueBlockNode', position: { x: baseX, y: yPos },
          data: { kind: 'dialogueBlock', chapterId, beatIndex: firstOrigIndex, lines } as DialogueBlockNodeData,
        });
        yPos += Y_GAP + (lines.length - 1) * 40;

      } else if ('choices' in firstBeat) {
        nodes.push({
          id: nodeId, type: 'choiceNode', position: { x: baseX, y: yPos },
          data: { kind: 'choice', chapterId, beatIndex: firstOrigIndex, choices: firstBeat.choices } as ChoiceNodeData,
        });
        yPos += Y_GAP + firstBeat.choices.length * 36;

      } else if ('gotoChapter' in firstBeat || 'gotoTrust' in firstBeat || 'gotoEnding' in firstBeat) {
        const target = 'gotoChapter' in firstBeat ? firstBeat.gotoChapter
          : 'gotoTrust' in firstBeat ? 'trust' : 'ending';
        nodes.push({
          id: nodeId, type: 'gotoNode', position: { x: baseX, y: yPos },
          data: { kind: 'goto', chapterId, beatIndex: firstOrigIndex, target } as GotoNodeData,
        });
        yPos += Y_GAP;
      }

      edges.push({ id: `e_${prevNodeId}_${nodeId}`, source: prevNodeId, target: nodeId, type: 'smoothstep' });
      prevNodeId = nodeId;
    });
  });

  return { nodes, edges };
}

/** 将节点 + 边转回 STORY 数据（展开 dialogueBlock 为多条 beats）*/
export function flowToStory(
  nodes: Node<StoryNodeData>[],
  _edges: Edge[]
): Record<string, StoryChapter> {
  const story: Record<string, StoryChapter> = {};

  const chapterNodes = nodes.filter(n => n.data.kind === 'chapter') as Node<ChapterNodeData>[];

  chapterNodes.forEach(chNode => {
    const chapterId = chNode.data.chapterId;
    const beatNodes = nodes
      .filter(n => n.data.kind !== 'chapter' && n.data.kind !== 'ending' && (n.data as any).chapterId === chapterId)
      .sort((a, b) => ((a.data as any).beatIndex ?? 0) - ((b.data as any).beatIndex ?? 0));

    const beats: Beat[] = [];
    beatNodes.forEach(n => {
      const d = n.data;
      if (d.kind === 'narration') { beats.push({ narration: true, line: d.line }); }
      else if (d.kind === 'dialogueBlock') {
        d.lines.forEach(l => beats.push({ speaker: l.speaker, line: l.line }));
      } else if (d.kind === 'choice') { beats.push({ choices: d.choices }); }
      else if (d.kind === 'goto') {
        if (d.target === 'trust') beats.push({ gotoTrust: true });
        else if (d.target === 'ending') beats.push({ gotoEnding: true });
        else beats.push({ gotoChapter: d.target });
      }
    });

    story[chapterId] = { scene: chNode.data.scene as any, title: chNode.data.title, beats };
  });

  return story;
}

/** 序列化为 story.ts */
export function storyToTypeScript(story: Record<string, StoryChapter>): string {
  const lines: string[] = [
    `import type { StoryChapter } from "../../types";`,
    ``,
    `export const STORY: Record<string, StoryChapter> = {`,
  ];

  const entries = Object.entries(story);
  entries.forEach(([chapterId, chapter], ci) => {
    const isLast = ci === entries.length - 1;
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
            const setStr = Object.entries(c.set).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
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
    lines.push(`  }${isLast ? '' : ','}`);
  });

  lines.push(`};`);
  lines.push(``);
  return lines.join('\n');
}
