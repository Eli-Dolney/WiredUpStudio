export const links = {
  youtube: "https://www.youtube.com/@LearningTheWires",
  discord: "https://discord.com/invite/kSB6Xsrrtf",
};

export const navItems = [
  { href: "#studio", label: "Studio" },
  { href: "#wires", label: "The Wires" },
  { href: "#games", label: "Games" },
  { href: "#mods", label: "Mods" },
  { href: "#lab", label: "Lab" },
  { href: "/3d-models", label: "3D Models" },
  { href: "#connect", label: "Connect" },
];

export const ventures = [
  {
    id: "01",
    name: "Learning the Wires",
    role: "Broadcast",
    href: "#wires",
    copy: "The YouTube channel. Unreal Engine, game development, and the messy middle of actually building things — on camera.",
  },
  {
    id: "02",
    name: "Games",
    role: "Shop floor",
    href: "#games",
    copy: "Original titles, from Table Tanks VR on Quest to Unreal experiments, plus mods for Minecraft and Black Ops III.",
  },
  {
    id: "03",
    name: "The Lab",
    role: "Side current",
    href: "#lab",
    copy: "Tools, web builds, and whatever else is on the bench. If it is charging under this roof, it belongs to the studio.",
  },
];

export const featuredGame = {
  code: "WUS-01",
  title: "Table Tanks VR",
  status: "Launching soon",
  platform: "Meta Quest 3 and 3S",
  engine: "Unity",
  tagline: "Small tanks. Big battles.",
  copy: "A top-down tank war shrunk onto your table. Play on your real desk in mixed reality or in a VR toy room, bank shots off walls, drop mines and outsmart a dozen kinds of enemy crews.",
  media: "/games/table-tanks",
  stats: [
    { value: "125", label: "Themed missions" },
    { value: "6", label: "Worlds and bosses" },
    { value: "32 v 32", label: "Army battles" },
    { value: "7", label: "VR rooms" },
  ],
  features: [
    "Mixed reality on your own desk, or seven VR rooms",
    "Endless waves, a daily challenge and Boss Rush",
    "Room battles: your scanned room becomes the arena",
    "A full map builder with instant playtests",
    "The Garage: paints, turrets, trails, sounds and skies",
  ],
  clips: [
    { file: "clip-tank-cam.mp4", label: "Tank cam", note: "Ride along behind your own turret." },
    { file: "clip-boss.mp4", label: "Boss fights", note: "Six worlds, six bosses." },
    { file: "clip-army.mp4", label: "Army command", note: "Up to 32 tanks a side." },
    { file: "clip-builder.mp4", label: "Map builder", note: "Build it, then play it." },
  ],
  shots: [
    { file: "screenshot-1-siege-engine.webp", alt: "A desert boss fight on the table" },
    { file: "screenshot-2-north-pole-dusk.webp", alt: "The North Pole at dusk with the Santa tank" },
    { file: "screenshot-4-moon-craters.webp", alt: "A moon mission with craters" },
    { file: "screenshot-6-world-map.webp", alt: "The campaign world map on the table" },
  ],
};

export const games = [
  {
    code: "WUS-02",
    title: "Putt Putt Party",
    status: "In the works",
    engine: "Unity",
    note: "VR mini golf built for hanging out: themed courses, party modes and a course editor so the holes never run dry.",
  },
  {
    code: "WUS-03",
    title: "Unreal prototypes",
    status: "On the bench",
    engine: "Unreal Engine 5",
    note: "Combat, movement and systems studies. Not trailers. Workbenches, built in public on Learning the Wires.",
  },
];

const gh = "https://github.com/Eli-Dolney/";

export const minecraftMods = [
  { title: "Helpful Workers", tag: "NeoForge 1.21.1", href: gh + "Helpful_NPC", note: "Recruit NPCs and run their jobs through dialogue, equipment menus and a reusable assignment clipboard." },
  { title: "Air Transport", tag: "NeoForge 1.21.1", href: gh + "LTW_Air_Transport", note: "Build hot-air-balloon airships from any blocks and fly them between landing pads, by hand or on autopilot." },
  { title: "Terraformer Tool", tag: "NeoForge 1.21.1", href: gh + "LTW_TerraformerTool", note: "Large-scale landscaping, survival construction and reusable build editing in one tool." },
  { title: "Speaker Systems", tag: "NeoForge 1.21.1", href: gh + "LTW_Speakers", note: "House audio for your base: phones, headphones, speakers, soundbars, subwoofers and a music display." },
  { title: "Useful Horse Armor", tag: "NeoForge 1.21.1", href: gh + "LTW_UsefulHorseArmor", note: "Turns vanilla horse armor into a tiered utility harness with module slots and riding bonuses." },
  { title: "Ragdoll", tag: "NeoForge 1.21.1", href: gh + "LTW_RagDoll", note: "Independent player ragdolls, with no extra physics mod required." },
  { title: "Evie & Eli Mobs", tag: "Java + Bedrock", href: gh + "Evie-Mob", note: "Evie the Dragon and Eli, King of the Seas, made for our family worlds." },
  { title: "Enhanced Shaders", tag: "Shader pack", href: gh + "LTW_Enhanced_Shaders", note: "A cozy, vibrant shader pack with a purple-and-lime palette and presets from laptops to high-end GPUs." },
];

export const bo3Mods = [
  { title: "Outpost", tag: "Zombies map", note: "A custom zombies map with its own front-end mod." },
  { title: "Ashford", tag: "Zombies map", note: "A custom zombies map in the works." },
  { title: "Proving Grounds", tag: "Zombies map", note: "The test range, where weapons, perks and systems get proven before they ship in a map." },
];

export const lab = [
  {
    title: "Creator toolkit",
    note: "Animation, watermark, and production helpers for Learning the Wires.",
  },
  {
    title: "Web experiments",
    note: "Sites, tools, and interfaces that do not need a steam page to exist.",
  },
  {
    title: "Game tooling",
    note: "Little machines that make the bigger machines easier to build.",
  },
];
