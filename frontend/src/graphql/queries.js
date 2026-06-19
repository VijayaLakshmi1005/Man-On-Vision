import { gql } from '@apollo/client';

export const GET_HERO_SECTION = gql`
  query GetHeroSection {
    hero {
      title
      highlightedWord
      subtitle
      buttonText
      buttonLink
      heroImage
    }
  }
`;

export const GET_VISION_SECTION = gql`
  query GetVisionSection {
    vision {
      title
      highlightedWord
      description
      buttonText
      artwork
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      title
      category
      description
      image
      link
    }
  }
`;

export const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      title
      description
      image
    }
  }
`;

export const GET_CONTACT_SECTION = gql`
  query GetContactSection {
    contact {
      title
      email
      instagram
      linkedin
      youtube
    }
  }
`;
