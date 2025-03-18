import { SkillCategory, Skill } from "@shared/schema";

interface SkillsSectionProps {
  categories: SkillCategory[];
  skills: Skill[];
}

export default function SkillsSection({ categories, skills }: SkillsSectionProps) {
  // Group skills by category
  const skillsByCategory = categories.map(category => {
    const categorySkills = skills.filter(skill => skill.categoryId === category.id);
    return {
      ...category,
      skills: categorySkills
    };
  });

  return (
    <section id="skills" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Skills</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            My Technical Expertise
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {skillsByCategory.map((category) => (
              <div className="relative" key={category.id}>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <i className={`fas fa-${category.icon}`}></i>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{category.name}</h3>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {category.skills.map((skill) => (
                        <div className="flex items-center" key={skill.id}>
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          <span className="text-sm text-gray-500">{skill.name}</span>
                        </div>
                      ))}
                      {/* If no skills in category, show message */}
                      {category.skills.length === 0 && (
                        <div className="col-span-2 text-sm text-gray-400 italic">
                          No skills added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* If no categories, show message */}
            {skillsByCategory.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500">No skill categories added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
