import type { Script } from '../types/screenplay';

export const isDemoMode =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const DEMO_USER = {
  uid: 'demo',
  displayName: 'Demo Writer',
  email: 'demo@example.com',
  isDemo: true,
};

export function demoGuard(toast: (msg: string) => void): boolean {
  if (isDemoMode) {
    toast('Demo mode — not saved');
    return true;
  }
  return false;
}

export const DEMO_SCRIPT: Script = {
  id: 'demo-script-001',
  title: 'The Last Signal',
  titlePage: {
    title: 'THE LAST SIGNAL',
    author: 'Demo Writer',
    draftDate: 'May 2026',
    contact: 'demo@example.com',
    copyright: '© 2026 Demo Writer',
  },
  blocks: [
    {
      id: 'b001',
      type: 'scene-heading',
      text: 'EXT. MOJAVE DESERT - DAY',
    },
    {
      id: 'b002',
      type: 'action',
      text: 'Endless sand stretches to the horizon. A RUSTED RELAY TOWER rises from the dunes, antenna still blinking despite the decay around it.',
    },
    {
      id: 'b003',
      type: 'action',
      text: 'A battered 4x4 kicks up dust as it pulls to a stop below the tower. MARA CROSS (38, sun-weathered, sharp-eyed) steps out, shielding her eyes.',
    },
    {
      id: 'b004',
      type: 'character',
      text: 'MARA',
    },
    {
      id: 'b005',
      type: 'parenthetical',
      text: '(into radio)',
    },
    {
      id: 'b006',
      type: 'dialogue',
      text: "Base, I'm at Tower Seven. Signal's still active. That shouldn't be possible.",
    },
    {
      id: 'b007',
      type: 'action',
      text: 'Static crackles. Then — a voice, barely audible.',
    },
    {
      id: 'b008',
      type: 'character',
      text: 'VOICE (V.O.)',
    },
    {
      id: 'b009',
      type: 'parenthetical',
      text: '(filtered, distorted)',
    },
    {
      id: 'b010',
      type: 'dialogue',
      text: "Mara. Don't come up. Please.",
    },
    {
      id: 'b011',
      type: 'action',
      text: 'Mara freezes. She knows that voice.',
    },
    {
      id: 'b012',
      type: 'transition',
      text: 'CUT TO:',
    },
    {
      id: 'b013',
      type: 'scene-heading',
      text: 'INT. RELAY TOWER - CONTROL ROOM - CONTINUOUS',
    },
    {
      id: 'b014',
      type: 'action',
      text: 'Banks of ancient equipment line the walls. Amber indicator lights pulse in slow rhythm. In the center — a CHAIR, its back to us. Someone is sitting in it.',
    },
    {
      id: 'b015',
      type: 'action',
      text: 'Mara enters, weapon drawn. She rounds the chair and STOPS.',
    },
    {
      id: 'b016',
      type: 'character',
      text: 'MARA',
    },
    {
      id: 'b017',
      type: 'dialogue',
      text: 'Cole. You died. I watched them bury you.',
    },
    {
      id: 'b018',
      type: 'action',
      text: 'COLE VANCE (40s, gaunt, pale as paper) turns slowly in the chair. There are wires trailing from his temples into the console behind him.',
    },
    {
      id: 'b019',
      type: 'character',
      text: 'COLE',
    },
    {
      id: 'b020',
      type: 'dialogue',
      text: "They buried a body. Doesn't mean it was me. Not all of me.",
    },
    {
      id: 'b021',
      type: 'transition',
      text: 'CUT TO:',
    },
    {
      id: 'b022',
      type: 'scene-heading',
      text: 'EXT. RELAY TOWER - ROOF - LATER',
    },
    {
      id: 'b023',
      type: 'action',
      text: "The sun is setting. Mara stands at the edge of the roof, phone pressed to her ear. Below, the desert glows orange. She's shaking.",
    },
    {
      id: 'b024',
      type: 'character',
      text: 'MARA',
    },
    {
      id: 'b025',
      type: 'parenthetical',
      text: '(into phone)',
    },
    {
      id: 'b026',
      type: 'dialogue',
      text: "Director, I need a full team out here. Cole Vance is alive. Or — something is. And it's been broadcasting for six years.",
    },
    {
      id: 'b027',
      type: 'action',
      text: 'A PAUSE on the line. Long. Too long.',
    },
    {
      id: 'b028',
      type: 'character',
      text: 'DIRECTOR (V.O.)',
    },
    {
      id: 'b029',
      type: 'dialogue',
      text: 'We know, Mara. We put him there.',
    },
    {
      id: 'b030',
      type: 'action',
      text: "Mara lowers the phone. Stares at nothing. The tower's antenna blinks behind her — steady, patient, eternal.",
    },
    {
      id: 'b031',
      type: 'transition',
      text: 'SMASH CUT TO BLACK.',
    },
    {
      id: 'b032',
      type: 'scene-heading',
      text: 'INT. GOVERNMENT FACILITY - SITUATION ROOM - NIGHT',
    },
    {
      id: 'b033',
      type: 'action',
      text: 'A dozen ANALYSTS stare at screens. On the largest monitor: a map of the Mojave. A single red dot pulses at Tower Seven.',
    },
    {
      id: 'b034',
      type: 'action',
      text: 'DIRECTOR CHEN (60s, silver-haired, no expression) sets down a coffee and picks up a phone.',
    },
    {
      id: 'b035',
      type: 'character',
      text: 'DIRECTOR CHEN',
    },
    {
      id: 'b036',
      type: 'parenthetical',
      text: '(into phone)',
    },
    {
      id: 'b037',
      type: 'dialogue',
      text: "Move to Phase Two. She's made contact.",
    },
    {
      id: 'b038',
      type: 'transition',
      text: 'CUT TO:',
    },
    {
      id: 'b039',
      type: 'scene-heading',
      text: 'INT. RELAY TOWER - CONTROL ROOM - NIGHT',
    },
    {
      id: 'b040',
      type: 'action',
      text: "Cole closes his eyes. The wires in his temples glow faintly. His lips move — no sound — but on every screen in the room, a single word appears:",
    },
    {
      id: 'b041',
      type: 'action',
      text: 'RUN.',
    },
    {
      id: 'b042',
      type: 'transition',
      text: 'FADE OUT.',
    },
    {
      id: 'b043',
      type: 'general',
      text: 'END OF ACT ONE',
    },
  ],
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-05-20'),
};
