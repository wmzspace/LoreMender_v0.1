# Sound Effects

UI interaction sounds, played via `playSfx()` in `src/lib/audio.ts`.
Procedurally synthesized (numpy/scipy, pentatonic scale), WAV format.

| File          | Used for |
|----------------|----------|
| `tap.wav`      | generic button press (default for any `.press`/`.btn-primary`/`.btn-ghost`/`.icon-btn` without a more specific sound) |
| `back.wav`     | Topbar back button |
| `nav.wav`      | BottomNav tab switch |
| `confirm.wav`  | ChoiceList option pick |
| `unlock.wav`   | first time an ending is unlocked |
