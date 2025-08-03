export interface ProfileFormData {
  username: string;
  discordId: string;
  shillYourself: string;
  expertises: string[];
  github: string;
  xHandle: string;
}

export const EXPERTISE_OPTIONS = [
  'Software Architecture', 
  'Blockchain Development', 
  'UI/UX Design', 
  'Product Management', 
  'Marketing', 
  'Community Management', 
  'Business Development', 
  'AI/ML', 
  'Cybersecurity', 
  'Legal/Compliance', 
  'Finance/Tokenomics', 
  'Content Creation',
];

export const validateProfileForm = (formData: ProfileFormData): string | null => {
  if (!formData.username.trim()) {
    return 'Username is required';
  }
  
  if (!formData.shillYourself.trim()) {
    return 'Please tell us about yourself';
  }
  
  if (formData.expertises.length === 0) {
    return 'Please select at least one expertise';
  }
  
  return null; // No errors
};

// Discord metadata'dan profile bilgilerini çıkarma utility'si
export const extractProfileFromDiscord = (user: any): Partial<ProfileFormData> => {
  console.log('Extracting profile from Discord user:', user);
  
  const userMetadata = user.user_metadata || {};
  const identities = user.identities || [];
  
  // Discord identity'sini bul
  const discordIdentity = identities.find((id: any) => id.provider === 'discord');
  
  // GitHub ve Twitter identity'lerini bul
  const githubIdentity = identities.find((id: any) => id.provider === 'github');
  const twitterIdentity = identities.find((id: any) => id.provider === 'twitter');
  
  console.log('Discord identity:', discordIdentity);
  console.log('GitHub identity:', githubIdentity);
  console.log('Twitter identity:', twitterIdentity);
  
  // Discord'dan gelen bilgileri parse et
  const discordData = discordIdentity?.identity_data || userMetadata;
  
  // Username öncelik sırası: Discord username > Discord display name > Full name > Email prefix
  const username = 
    discordData.username || 
    discordData.global_name || 
    discordData.full_name || 
    userMetadata.name || 
    user.email?.split('@')[0] || 
    'User';
  
  // Discord ID
  const discordId = 
    discordData.id || 
    userMetadata.provider_id || 
    userMetadata.sub || 
    '';
  
  // Bio/About me bilgisi varsa shill yourself için kullan
  const shillYourself = discordData.bio || discordData.about_me || '';
  
  // GitHub username
  const github = 
    githubIdentity?.identity_data?.user_name || 
    githubIdentity?.identity_data?.login || 
    '';
  
  // Twitter/X handle
  const xHandle = 
    twitterIdentity?.identity_data?.user_name || 
    twitterIdentity?.identity_data?.screen_name || 
    '';
  
  const result = {
    username,
    discordId,
    shillYourself,
    github,
    xHandle,
    expertises: [] // Bu Discord'dan gelmiyor
  };
  
  console.log('Extracted profile data:', result);
  return result;
};