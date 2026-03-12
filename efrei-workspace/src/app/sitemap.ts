import { MetadataRoute } from 'next';
import { getProjects, getReports } from '@/services/firestoreService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://efrei.massil-abba.fr';

    const projects = await getProjects();
    const reports = await getReports();

    const projectUrls = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const reportUrls = reports.map((r) => ({
        url: `${baseUrl}/reports/${r.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...projectUrls,
        ...reportUrls,
    ];
}
