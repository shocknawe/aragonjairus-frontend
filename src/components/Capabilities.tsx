import { capabilities } from '../data/portfolio';

export default function Capabilities() {
  return (
    <section className="section caps" id="capabilities">
      <div className="container">
        <div className="section__head">
          <h2 className="section__title" data-reveal>
            What I <em>do</em>
          </h2>
          <span className="section-index" data-reveal>
            (01) Capabilities
          </span>
        </div>

        {capabilities.map((cap) => (
          <div
            className="caps__group"
            key={cap.id}
            style={{ '--cat': cap.color } as React.CSSProperties}
          >
            <div>
              <h3 className="caps__cat" data-reveal>
                {cap.title}
              </h3>
              <p className="caps__desc" data-reveal>
                {cap.blurb}
              </p>
            </div>
            <div className="caps__grid">
              {cap.skills.map((skill) => (
                <div className="skill" key={skill.name} data-reveal>
                  <span className="skill__dot" />
                  <span className="skill__name">{skill.name}</span>
                  <span className="skill__years">{skill.years}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
