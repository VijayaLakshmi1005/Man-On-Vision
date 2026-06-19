const typeDefs = `#graphql
  type HeroSection {
    title: String
    highlightedWord: String
    subtitle: String
    buttonText: String
    buttonLink: String
    heroImage: String
  }

  type VisionSection {
    title: String
    highlightedWord: String
    description: String
    buttonText: String
    artwork: String
  }

  type Project {
    id: ID
    title: String
    category: String
    description: String
    image: String
    link: String
  }

  type Service {
    id: ID
    title: String
    description: String
    image: String
  }

  type ContactSection {
    title: String
    email: String
    instagram: String
    linkedin: String
    youtube: String
  }

  type Query {
    hero: HeroSection
    vision: VisionSection
    projects: [Project]
    services: [Service]
    contact: ContactSection
  }
`;

module.exports = typeDefs;
