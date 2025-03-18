import { Experience } from "@shared/schema";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  // Sort experiences by start date (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <section id="experience" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Experience</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            My Professional Journey
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          {sortedExperiences.length > 0 ? (
            sortedExperiences.map((experience) => (
              <div key={experience.id} className="flex flex-col md:flex-row border-l-4 border-primary pl-4 md:pl-0 mb-10">
                <div className="md:w-48 flex-shrink-0 mb-4 md:mb-0">
                  <div className="md:text-right md:pr-8 md:pt-2">
                    <span className="text-sm font-medium text-primary">
                      {experience.startDate} - {experience.endDate || 'Present'}
                    </span>
                  </div>
                </div>
                
                <div className="md:border-l-4 md:border-primary md:pl-4 flex-grow">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-gray-900">{experience.title}</h3>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{experience.type}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="fas fa-building mr-2"></i>
                      <span>{experience.company}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      <span>{experience.location}</span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {experience.description}
                    </p>
                    {experience.technologies && experience.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {experience.technologies.map((tech: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No experiences added yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
