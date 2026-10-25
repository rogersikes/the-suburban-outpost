export interface EditorialAuthor {
  id: string;
  name: string;
  role: string;
  credentials: string;
  avatar: string;
  bio: string;
  categories: string[];
  fieldSpecialties: string[];
}

export const EDITORIAL_TEAM: Record<string, EditorialAuthor> = {
  elena_rostova: {
    id: 'elena_rostova',
    name: 'Elena Rostova, PE',
    role: 'Hydrological Systems Engineer & Water Infrastructure Lead',
    credentials: 'PE (Civil/Environmental Hydrology), ASSE 1061 Certified',
    avatar: '/avatars/elena-rostova.svg',
    bio: 'Elena Rostova is a licensed professional engineer specializing in decentralized residential hydrology, submersible deep well pressure systems, gravity-fed cistern engineering, and stealth HOA-compliant rainwater harvesting infrastructure.',
    categories: ['Water Systems'],
    fieldSpecialties: ['Submersible Well Systems', 'Pressure Tanks', 'Rainwater Harvesting', 'Gravity Filtration', 'Backflow Prevention']
  },
  marcus_vance: {
    id: 'marcus_vance',
    name: 'Marcus Vance',
    role: 'Master Electrician & Solar Off-Grid Specialist',
    credentials: 'Master Electrician (NEC 702/705), NABCEP PV Professional',
    avatar: '/avatars/marcus-vance.svg',
    bio: 'Marcus Vance has spent 18 years engineering suburban backup electrical systems, LiFePO4 server rack storage banks, zero-noise manual transfer interlocks, and code-compliant residential solar microgrids.',
    categories: ['Solar & Power'],
    fieldSpecialties: ['NEC 702 Compliance', 'LiFePO4 Storage', 'Whole-Home Interlocks', 'Solar Microgrids', 'Silent Backup Inverters']
  },
  caleb_thorne: {
    id: 'caleb_thorne',
    name: 'Caleb Thorne',
    role: 'Certified Hearth Specialist & Thermal Systems Lead',
    credentials: 'NFI Certified Woodburning Specialist, CSIA Hearth Inspector',
    avatar: '/avatars/caleb-thorne.svg',
    bio: 'Caleb Thorne leads thermal systems evaluation for The Suburban Outpost, testing EPA 2026 clean air biomass stoves, double-wall chimney clearances, secondary flue draft physics, and suburban firewood seasoning.',
    categories: ['Heating & Stoves'],
    fieldSpecialties: ['EPA 2026 Clean Air Stoves', 'Double-Wall Flues', 'Biomass Pellet Heaters', 'Clearance-to-Combustibles', 'Draft Physics']
  },
  sarah_lin: {
    id: 'sarah_lin',
    name: 'Dr. Sarah Lin',
    role: 'Environmental Microbiologist & Permaculture Lead',
    credentials: 'Ph.D. Microbiology, Permaculture Design Certificate (PDC)',
    avatar: '/avatars/sarah-lin.svg',
    bio: 'Dr. Sarah Lin specializes in residential closed-loop sanitation, urine-diverting waterless composting toilets, root cellar micro-climates, and safe long-term household food preservation within municipal boundaries.',
    categories: ['Sanitation', 'Food & Homestead'],
    fieldSpecialties: ['Waterless Composting', 'Urine Diversion', 'Cold Root Cellaring', 'Pathogen Neutralization', 'Suburban Permaculture']
  },
  devon_reed: {
    id: 'devon_reed',
    name: 'Devon Reed',
    role: 'Municipal Zoning & HOA Rights Advocate',
    credentials: 'J.D., Former Planning Commission Consultant',
    avatar: '/avatars/devon-reed.svg',
    bio: 'Devon Reed focuses on suburban zoning defense, Federal OTARD solar protections, municipal rainwater collection rights, and stealth property perimeter design within strict HOA deed covenants.',
    categories: ['Legal & Codes', 'Urban & Fringe'],
    fieldSpecialties: ['HOA Covenant Defense', 'OTARD Solar Law', 'Suburban Utility Easements', 'Certificate of Occupancy', 'Perimeter Concealment']
  },
  roger_sikes: {
    id: 'roger_sikes',
    name: 'Roger Sikes',
    role: 'Editorial Director & Founder',
    credentials: 'Field Test Director & Systems Architect',
    avatar: '/avatars/roger-sikes.svg',
    bio: 'Roger Sikes founded The Suburban Outpost to provide rigorously tested engineering manuals for suburban self-reliance. He coordinates peer review across the technical staff, ensuring every guide complies with building codes and neighborhood realities.',
    categories: [],
    fieldSpecialties: ['Systems Integration', 'Field Verification', 'Suburban Resilience Architecture']
  }
};

export const EDITORIAL_TEAM_LIST: EditorialAuthor[] = Object.values(EDITORIAL_TEAM);

export function getAuthorForCategory(category: string): EditorialAuthor {
  const cat = (category || '').toLowerCase();
  if (cat.includes('water')) return EDITORIAL_TEAM.elena_rostova;
  if (cat.includes('solar') || cat.includes('power') || cat.includes('battery') || cat.includes('electric')) return EDITORIAL_TEAM.marcus_vance;
  if (cat.includes('heat') || cat.includes('stove') || cat.includes('wood') || cat.includes('flue')) return EDITORIAL_TEAM.caleb_thorne;
  if (cat.includes('sanitat') || cat.includes('toilet') || cat.includes('food') || cat.includes('homestead')) return EDITORIAL_TEAM.sarah_lin;
  if (cat.includes('legal') || cat.includes('code') || cat.includes('hoa') || cat.includes('urban') || cat.includes('fringe')) return EDITORIAL_TEAM.devon_reed;
  return EDITORIAL_TEAM.roger_sikes;
}

export function getAuthorByName(name: string): EditorialAuthor {
  if (!name) return EDITORIAL_TEAM.roger_sikes;
  const lower = name.toLowerCase().trim();
  const match = Object.values(EDITORIAL_TEAM).find(a => 
    a.name.toLowerCase() === lower || 
    lower.includes(a.name.toLowerCase()) || 
    a.name.toLowerCase().includes(lower) ||
    lower.startsWith(a.name.toLowerCase().split(' ')[0])
  );
  return match || EDITORIAL_TEAM.roger_sikes;
}
