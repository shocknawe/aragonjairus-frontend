export type Skill = { name: string; years: string };

export type Capability = {
  id: string;
  title: string;
  blurb: string;
  color: string;
  skills: Skill[];
};

export const capabilities: Capability[] = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    blurb:
      'My core. I build fast, maintainable front-ends in React and TypeScript — from design systems to micro-frontends in production at scale.',
    color: 'var(--c-violet)',
    skills: [
      { name: 'React', years: '8 yrs' },
      { name: 'TypeScript', years: '6 yrs' },
      { name: 'Redux', years: '7 yrs' },
      { name: 'React Query', years: '4 yrs' },
      { name: 'Module Federation', years: '3 yrs' },
      { name: 'React Table', years: '4 yrs' },
    ],
  },
  {
    id: 'design',
    title: 'Interface & Design',
    blurb:
      'Half a decade inside a design studio taught me to sweat the details. I’m fluent in the tools and the craft behind a considered, pixel-perfect UI.',
    color: 'var(--c-green)',
    skills: [
      { name: 'Figma', years: '6 yrs' },
      { name: 'Sketch', years: '8 yrs' },
      { name: 'Adobe XD', years: '6 yrs' },
      { name: 'Photoshop', years: '16 yrs' },
      { name: 'Miro', years: '5 yrs' },
    ],
  },
  {
    id: 'commerce',
    title: 'Commerce & Content',
    blurb:
      'Years shipping Shopify and WordPress builds — fast storefronts tuned for conversion with search, email and A/B testing.',
    color: 'var(--c-amber)',
    skills: [
      { name: 'Shopify', years: '7 yrs' },
      { name: 'Slate', years: '7 yrs' },
      { name: 'WordPress', years: '11 yrs' },
      { name: 'Algolia', years: '6 yrs' },
      { name: 'Klaviyo', years: '4 yrs' },
    ],
  },
  {
    id: 'quality',
    title: 'Quality & Testing',
    blurb:
      'Good work is tested work. I build with TDD, document in Storybook, and cover the flows that matter end-to-end.',
    color: 'var(--c-red)',
    skills: [
      { name: 'Jest', years: '6 yrs' },
      { name: 'Testing Library', years: '5 yrs' },
      { name: 'Storybook', years: '5 yrs' },
      { name: 'Cypress', years: '4 yrs' },
      { name: 'Mirage JS', years: '3 yrs' },
    ],
  },
];

export type Project = {
  num: string;
  name: string;
  tags: string;
  year: string;
  url?: string;
};

export const projects: Project[] = [
  {
    num: '01',
    name: 'Swee Lee',
    tags: 'Shopify · eCommerce · CRO',
    year: '2019',
    url: 'https://www.sweelee.com.sg/',
  },
  { num: '02', name: 'RM Workbench', tags: 'Investment Bank · React · Micro-frontends', year: '2023' },
  { num: '03', name: 'Daily Banking', tags: 'Banking App · React · Prototype', year: '2022' },
  { num: '04', name: 'Samsung Campaigns', tags: 'Cheil · Creative Dev · Motion', year: '2020' },
  {
    num: '05',
    name: 'Shooting Gallery Asia',
    tags: 'WordPress · Portfolio · Canvas',
    year: '2017',
    url: 'http://www.shootinggalleryasia.com',
  },
];

export const awards = [
  'The Webby Awards',
  'Awwwards',
  'Creative Guild Awards',
  'Adobo Magazine',
  'Philippine Ad Congress',
];
