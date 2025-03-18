import { About } from "@shared/schema";

interface AboutSectionProps {
  about: About;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const { bio, additionalInfo, profileImage, details, socialLinks } = about;

  return (
    <section id="about" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">About Me</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Who I Am
          </p>
        </div>

        <div className="mt-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg">
                <img 
                  className="object-cover w-full h-full" 
                  src={profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80"} 
                  alt="Profile" 
                />
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 lg:col-span-7">
              <div className="prose prose-lg text-gray-500 mx-auto lg:max-w-none">
                <p>{bio}</p>
                {additionalInfo && <p>{additionalInfo}</p>}
              </div>
              
              {details && details.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {details.map((detail: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className={`fas fa-${detail.icon} text-primary`}></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">{detail.label}</h3>
                        <p className="text-sm text-gray-500">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {socialLinks && socialLinks.length > 0 && (
                <div className="mt-6 flex space-x-4">
                  {socialLinks.map((social: any, index: number) => (
                    <a 
                      key={index} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-primary"
                    >
                      <span className="sr-only">{social.platform}</span>
                      <i className={`fab fa-${social.icon} text-xl`}></i>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
