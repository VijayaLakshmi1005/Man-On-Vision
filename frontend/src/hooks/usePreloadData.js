import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_HERO_SECTION, GET_VISION_SECTION, GET_PROJECTS, GET_SERVICES, GET_CONTACT_SECTION } from '../graphql/queries';

export function usePreloadData() {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { data: heroData, loading: l1 } = useQuery(GET_HERO_SECTION);
  const { data: visionData, loading: l2 } = useQuery(GET_VISION_SECTION);
  const { data: projectsData, loading: l3 } = useQuery(GET_PROJECTS);
  const { data: servicesData, loading: l4 } = useQuery(GET_SERVICES);
  const { data: contactData, loading: l5 } = useQuery(GET_CONTACT_SECTION);

  const isDataLoading = l1 || l2 || l3 || l4 || l5;

  useEffect(() => {
    if (!isDataLoading) {
      const imageUrls = [];
      if (heroData?.hero?.heroImage) imageUrls.push(heroData.hero.heroImage);
      if (visionData?.vision?.image) imageUrls.push(visionData.vision.image);
      if (projectsData?.projects) {
        projectsData.projects.forEach(p => p.image && imageUrls.push(p.image));
      }
      if (servicesData?.services) {
        servicesData.services.forEach(s => s.image && imageUrls.push(s.image));
      }

      if (imageUrls.length === 0) {
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imageUrls.length) setImagesLoaded(true);
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === imageUrls.length) setImagesLoaded(true);
        };
      });
    }
  }, [isDataLoading, heroData, visionData, projectsData, servicesData]);

  return {
    isReady: !isDataLoading && imagesLoaded,
  };
}
