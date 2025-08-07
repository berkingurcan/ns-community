-- =============================================
-- NSPHERE SAMPLE DATA INSERTION
-- Creates sample data for development and testing
-- =============================================

-- First, let's create some sample users in user_profiles table
-- Note: These IDs should match real auth.users IDs in production

-- Sample User Profiles
INSERT INTO user_profiles (
  id, 
  username, 
  discord_id, 
  discord_username,
  shill_yourself, 
  avatar_url,
  expertises, 
  github, 
  x_handle,
  status,
  created_at, 
  updated_at
) VALUES 
-- User 1: Founder/Admin
('11111111-1111-1111-1111-111111111111', 'yamancan', 'yamancan#1234', 'yamancan', 
 'Founder of NSphere. Building the future of decentralized communities with Web3 and AI. Passionate about creating tools that empower builders.', 
 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamancan',
 ARRAY['Product Management', 'Web3', 'Community Building'],
 'yamancan', 'yamancan', 'active', NOW(), NOW()),

-- User 2: Developer
('22222222-2222-2222-2222-222222222222', 'alex_builder', 'alexbuilder#5678', 'alexbuilder',
 'Full-stack developer specializing in React, Node.js, and Solana. Love building DeFi protocols and NFT marketplaces.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
 ARRAY['Frontend Development', 'Backend Development', 'Solana'],
 'alexbuilder', 'alex_builds', 'active', NOW(), NOW()),

-- User 3: Designer
('33333333-3333-3333-3333-333333333333', 'sarah_designs', 'sarahux#9012', 'sarahux',
 'UI/UX designer with 5+ years experience. Specialized in Web3 interfaces and creating intuitive user experiences for complex DApps.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
 ARRAY['UI/UX Design', 'Figma', 'User Research'],
 'sarahdesigns', 'sarah_ux', 'active', NOW(), NOW()),

-- User 4: Marketing Expert
('44444444-4444-4444-4444-444444444444', 'mike_growth', 'mikegrowth#3456', 'mikegrowth',
 'Growth hacker and marketing strategist. Helped scale 3 Web3 startups from 0 to 100k+ users. Expert in community building and viral marketing.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
 ARRAY['Marketing', 'Community Building', 'Growth Hacking'],
 'mikegrowth', 'mike_grows', 'active', NOW(), NOW()),

-- User 5: Blockchain Developer
('55555555-5555-5555-5555-555555555555', 'crypto_dev', 'cryptodev#7890', 'cryptodev',
 'Blockchain engineer with expertise in Ethereum, Solana, and Polygon. Built 10+ smart contracts and DeFi protocols.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto',
 ARRAY['Smart Contracts', 'DeFi', 'Blockchain'],
 'cryptodev', 'crypto_builds', 'active', NOW(), NOW()),

-- User 6: Data Scientist  
('66666666-6666-6666-6666-666666666666', 'data_alice', 'alicedata#2468', 'alicedata',
 'Data scientist and AI researcher. Working on machine learning models for Web3 analytics and predictive DeFi strategies.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
 ARRAY['Data Science', 'Machine Learning', 'Analytics'],
 'dataalice', 'alice_data', 'active', NOW(), NOW()),

-- User 7: Content Creator
('77777777-7777-7777-7777-777777777777', 'content_king', 'contentking#1357', 'contentking',
 'Content creator and educator in the Web3 space. YouTube channel with 50k+ subscribers. Love explaining complex concepts simply.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=content',
 ARRAY['Content Creation', 'Education', 'Video Production'],
 'contentking', 'content_king_yt', 'active', NOW(), NOW()),

-- User 8: Business Developer
('88888888-8888-8888-8888-888888888888', 'biz_emma', 'emmabd#9753', 'emmabd',
 'Business development professional with strong network in Web3. Helped close $2M+ in partnerships and deals.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
 ARRAY['Business Development', 'Partnerships', 'Sales'],
 'emmabiz', 'emma_biz', 'active', NOW(), NOW()),

-- User 9: Security Expert
('99999999-9999-9999-9999-999999999999', 'sec_expert', 'secexpert#8642', 'secexpert',
 'Cybersecurity specialist focused on Web3 and smart contract auditing. Discovered 20+ critical vulnerabilities in major protocols.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=security',
 ARRAY['Security Auditing', 'Smart Contract Security', 'Penetration Testing'],
 'secexpert', 'sec_auditor', 'active', NOW(), NOW()),

-- User 10: Community Manager
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'community_jen', 'jencomm#1975', 'jencomm',
 'Community manager with experience building and scaling Web3 communities. Managed Discord servers with 10k+ active members.',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=jen',
 ARRAY['Community Management', 'Discord Management', 'Social Media'],
 'jencomm', 'jen_community', 'active', NOW(), NOW());

-- =============================================
-- SAMPLE PROJECTS
-- =============================================

INSERT INTO projects (
  id,
  user_id,
  title,
  description,
  image_url,
  github_url,
  live_url,
  twitter_url,
  website_url,
  tags,
  status,
  categories,
  collaboration_status,
  looking_for_collaboration,
  collaboration_description,
  max_collaborators,
  current_collaborators,
  created_at,
  updated_at
) VALUES
-- Project 1: DeFi Protocol
('proj-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'NSphere DeFi Protocol', 
 'A revolutionary DeFi protocol built on Solana that enables community-driven liquidity mining and governance. Features include automated yield farming, flash loans, and DAO governance mechanisms.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=defi',
 'https://github.com/nsphere/defi-protocol',
 'https://app.nsphere-defi.com',
 'https://twitter.com/nsphere_defi',
 'https://nsphere-defi.com',
 ARRAY['DeFi', 'Solana', 'Yield Farming', 'DAO'],
 'showcase',
 ARRAY['DeFi', 'Protocol'],
 'open',
 ARRAY['Smart Contract Development', 'Frontend Development'],
 'Looking for experienced Solana developers and UI/UX designers to help scale our DeFi protocol.',
 3, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

-- Project 2: NFT Marketplace
('proj-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'CreatorSpace NFT Marketplace',
 'A next-generation NFT marketplace focused on digital artists and creators. Features include lazy minting, royalty management, and social features for artists to build communities around their work.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=nft',
 'https://github.com/creatorspace/nft-marketplace',
 'https://creatorspace.art',
 'https://twitter.com/creatorspace_nft',
 'https://creatorspace.art',
 ARRAY['NFT', 'Marketplace', 'Art', 'Creators'],
 'showcase',
 ARRAY['NFT', 'Marketplace'],
 'open',
 ARRAY['Backend Development', 'Marketing'],
 'Seeking backend engineers and marketing specialists to help grow our artist community.',
 4, 2, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),

-- Project 3: Web3 Analytics
('proj-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'ChainInsights Analytics',
 'Advanced blockchain analytics platform providing real-time insights for DeFi protocols, NFT collections, and wallet tracking. Built with machine learning algorithms for predictive analysis.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=analytics',
 'https://github.com/chaininsights/analytics-platform',
 'https://chaininsights.io',
 'https://twitter.com/chaininsights',
 'https://chaininsights.io',
 ARRAY['Analytics', 'Machine Learning', 'DeFi', 'Data'],
 'showcase',
 ARRAY['Analytics', 'Data Science'],
 'open',
 ARRAY['Data Science', 'Frontend Development'],
 'Looking for data scientists and React developers to enhance our analytics capabilities.',
 2, 0, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),

-- Project 4: DAO Governance Tool
('proj-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 'GovTools DAO Platform',
 'A comprehensive DAO governance platform that simplifies proposal creation, voting mechanisms, and treasury management. Features multi-signature wallets and automated execution.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=dao',
 'https://github.com/govtools/dao-platform',
 'https://govtools.xyz',
 'https://twitter.com/govtools_dao',
 'https://govtools.xyz',
 ARRAY['DAO', 'Governance', 'Web3', 'Treasury'],
 'NS-Only',
 ARRAY['DAO', 'Governance'],
 'open',
 ARRAY['Smart Contract Development', 'UI/UX Design'],
 'Need smart contract developers and UI/UX designers to improve governance UX.',
 3, 1, NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),

-- Project 5: Learning Platform
('proj-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
 'Web3 Academy',
 'An interactive learning platform for Web3 education. Features hands-on coding challenges, smart contract tutorials, and certification programs for developers entering the Web3 space.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=education',
 'https://github.com/web3academy/learning-platform',
 'https://web3academy.dev',
 'https://twitter.com/web3academy',
 'https://web3academy.dev',
 ARRAY['Education', 'Web3', 'Learning', 'Certification'],
 'showcase',
 ARRAY['Education', 'Platform'],
 'open',
 ARRAY['Content Creation', 'Frontend Development'],
 'Seeking content creators and frontend developers to expand our course library.',
 5, 3, NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),

-- Project 6: Privacy Protocol
('proj-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
 'PrivacyChain Protocol',
 'A privacy-focused blockchain protocol using zero-knowledge proofs for confidential transactions. Enables private DeFi and confidential smart contract execution.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=privacy',
 'https://github.com/privacychain/protocol',
 'https://privacychain.org',
 'https://twitter.com/privacychain',
 'https://privacychain.org',
 ARRAY['Privacy', 'ZK-Proofs', 'Blockchain', 'DeFi'],
 'Draft',
 ARRAY['Protocol', 'Privacy'],
 'closed',
 ARRAY[],
 'Currently in stealth mode, not seeking collaborators yet.',
 1, 1, NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day'),

-- Project 7: Social DApp
('proj-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777',
 'DecentralBook',
 'A decentralized social media platform built on Web3 principles. Users own their data, content is stored on IPFS, and creators are rewarded with tokens for engagement.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=social',
 'https://github.com/decentralbook/social-dapp',
 'https://decentralbook.social',
 'https://twitter.com/decentralbook',
 'https://decentralbook.social',
 ARRAY['Social Media', 'IPFS', 'Tokenomics', 'Creator Economy'],
 'showcase',
 ARRAY['Social', 'DApp'],
 'open',
 ARRAY['Mobile Development', 'Backend Development'],
 'Looking for mobile developers and backend engineers to build our mobile app.',
 4, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),

-- Project 8: Gaming Platform
('proj-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888',
 'MetaQuest Gaming',
 'A blockchain-based gaming platform where players truly own their in-game assets as NFTs. Features play-to-earn mechanics and cross-game asset interoperability.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=gaming',
 'https://github.com/metaquest/gaming-platform',
 'https://metaquest.game',
 'https://twitter.com/metaquest_game',
 'https://metaquest.game',
 ARRAY['Gaming', 'NFT', 'Play-to-Earn', 'Metaverse'],
 'NS-Only',
 ARRAY['Gaming', 'NFT'],
 'open',
 ARRAY['Game Development', 'Smart Contract Development'],
 'Seeking game developers and blockchain engineers for our P2E gaming ecosystem.',
 6, 4, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),

-- Project 9: Infrastructure Tool
('proj-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999',
 'DevOps3 Infrastructure',
 'Web3-native DevOps tools for deploying and managing decentralized applications. Features automated smart contract deployment, monitoring, and scaling solutions.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=devops',
 'https://github.com/devops3/infrastructure',
 'https://devops3.tools',
 'https://twitter.com/devops3_tools',
 'https://devops3.tools',
 ARRAY['DevOps', 'Infrastructure', 'Automation', 'Monitoring'],
 'showcase',
 ARRAY['Infrastructure', 'DevOps'],
 'open',
 ARRAY['DevOps', 'Backend Development'],
 'Need DevOps engineers and backend developers to scale our infrastructure tools.',
 3, 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'),

-- Project 10: Community Platform
('proj-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'BuilderHub Community',
 'A community platform specifically designed for Web3 builders to collaborate, share resources, and find co-founders. Features project showcases, skill matching, and bounty boards.',
 'https://api.dicebear.com/7.x/shapes/svg?seed=community',
 'https://github.com/builderhub/community-platform',
 'https://builderhub.xyz',
 'https://twitter.com/builderhub_xyz',
 'https://builderhub.xyz',
 ARRAY['Community', 'Collaboration', 'Web3', 'Networking'],
 'showcase',
 ARRAY['Community', 'Platform'],
 'open',
 ARRAY['Community Management', 'Frontend Development'],
 'Looking for community managers and frontend developers to enhance user experience.',
 4, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

-- =============================================
-- CONTINENTAL COINS - Give 10 coins to all users
-- =============================================

INSERT INTO user_coin_balances (user_id, balance, total_earned, updated_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 10, 10, NOW()),
('22222222-2222-2222-2222-222222222222', 10, 10, NOW()),
('33333333-3333-3333-3333-333333333333', 10, 10, NOW()),
('44444444-4444-4444-4444-444444444444', 10, 10, NOW()),
('55555555-5555-5555-5555-555555555555', 10, 10, NOW()),
('66666666-6666-6666-6666-666666666666', 10, 10, NOW()),
('77777777-7777-7777-7777-777777777777', 10, 10, NOW()),
('88888888-8888-8888-8888-888888888888', 10, 10, NOW()),
('99999999-9999-9999-9999-999999999999', 10, 10, NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10, 10, NOW());

-- Create coin transactions for the initial bonus
INSERT INTO coin_transactions (
  id, from_user_id, to_user_id, amount, transaction_type, 
  description, metadata, status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  NULL, -- System transaction
  user_id,
  10,
  'registration_bonus',
  'Welcome to NSphere! Your Continental Coins await.',
  '{"bonus_type": "initial_setup"}',
  'completed',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
FROM user_coin_balances;

-- =============================================
-- COLLABORATION REQUESTS
-- =============================================

-- Note: We need to check if collaboration_requests table exists
-- This would typically be created by a separate migration

-- Sample collaboration requests (assuming table exists)
-- INSERT INTO collaboration_requests (
--   id, project_id, requester_id, project_owner_id, 
--   collaboration_type, intro_message, status, created_at, updated_at
-- ) VALUES
-- ('req-1111-1111-1111-111111111111', 'proj-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
--  'Smart Contract Development', 'Hi! I have 3+ years of Solana development experience and would love to contribute to your DeFi protocol. I specialize in AMM implementations and yield farming contracts.', 
--  'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
-- 
-- ('req-2222-2222-2222-222222222222', 'proj-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
--  'UI/UX Design', 'Love your NFT marketplace concept! I have extensive experience designing Web3 interfaces and would like to help improve the user experience for artists.', 
--  'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
-- 
-- ('req-3333-3333-3333-333333333333', 'proj-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333',
--  'Data Science', 'Your analytics platform looks amazing! I have ML experience and would love to contribute to the predictive algorithms. Can we discuss collaboration?', 
--  'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
-- 
-- ('req-4444-4444-4444-444444444444', 'proj-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555',
--  'Content Creation', 'I run a YouTube channel with 50k+ Web3 subscribers. Would love to create educational content for your Web3 Academy platform!', 
--  'accepted', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days'),
-- 
-- ('req-5555-5555-5555-555555555555', 'proj-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777',
--  'Backend Development', 'Your decentralized social platform is exactly what the world needs! I have experience with IPFS and P2P networks. Let me help build the backend!', 
--  'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- =============================================
-- OPPORTUNITIES (if opportunities table exists)
-- =============================================

-- Sample opportunities related to projects
-- INSERT INTO opportunities (
--   id, project_id, title, description, opportunity_type, 
--   skills_required, compensation, status, created_at, updated_at
-- ) VALUES
-- ('opp-1111-1111-1111-111111111111', 'proj-1111-1111-1111-111111111111',
--  'Senior Solana Developer', 
--  'We are looking for an experienced Solana developer to help build our AMM and yield farming contracts. This is a paid position with equity options.',
--  'Full-time', ARRAY['Smart Contract Development', 'Solana', 'Rust'],
--  '5000 USDC + equity', 'open', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
-- 
-- ('opp-2222-2222-2222-222222222222', 'proj-2222-2222-2222-222222222222',
--  'UI/UX Designer for NFT Platform', 
--  'Looking for a creative UI/UX designer to redesign our NFT marketplace interface. Focus on artist onboarding and discovery features.',
--  'Contract', ARRAY['UI/UX Design', 'Figma', 'Web3 UX'],
--  '3000 USDC', 'open', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
-- 
-- ('opp-3333-3333-3333-333333333333', 'proj-3333-3333-3333-333333333333',
--  'Data Scientist - ML Engineer', 
--  'Join our team to build predictive models for DeFi analytics. Experience with time series analysis and blockchain data required.',
--  'Part-time', ARRAY['Data Science', 'Machine Learning', 'Python'],
--  '2500 USDC/month', 'open', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
-- 
-- ('opp-4444-4444-4444-444444444444', 'proj-5555-5555-5555-555555555555',
--  'Content Creator - Web3 Education', 
--  'Create engaging educational content for our Web3 Academy. Video production and teaching experience preferred.',
--  'Contract', ARRAY['Content Creation', 'Video Production', 'Education'],
--  '100 USDC per video', 'filled', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),
-- 
-- ('opp-5555-5555-5555-555555555555', 'proj-9999-9999-9999-999999999999',
--  'DevOps Engineer - Web3 Infrastructure', 
--  'Help us scale our Web3 DevOps tools. Experience with Kubernetes, Docker, and blockchain infrastructure required.',
--  'Full-time', ARRAY['DevOps', 'Kubernetes', 'Infrastructure'],
--  '6000 USDC + tokens', 'open', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- =============================================
-- SUMMARY
-- =============================================
-- This script creates:
-- ✅ 10 diverse user profiles with different expertise areas
-- ✅ 10 varied projects covering different Web3 sectors  
-- ✅ 10 Continental Coins for each user (100 total)
-- ✅ Initial coin transaction records
-- ✅ 5 sample collaboration requests (commented out - depends on table existence)
-- ✅ 5 sample opportunities (commented out - depends on table existence)

SELECT 'Sample data insertion completed!' as status;
