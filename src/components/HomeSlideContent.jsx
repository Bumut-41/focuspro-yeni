/** Ana sayfa hero slayt gövdesi — paragraf, blok ve listeler. */
function isWideBlock(block) {
  return (
    Boolean(block.subblocks?.length) ||
    Boolean(block.text && block.text.length > 140) ||
    Boolean(block.items && block.items.length > 4)
  );
}

export function HomeSlideContent({ slide }) {
  if (!slide) return null;

  return (
    <div className={`fp-hero-body${slide.rich ? " fp-hero-body--rich" : ""}`}>
      {(slide.lead || slide.paragraphs?.length > 0) && (
        <div className="fp-hero-intro">
          {slide.lead && <p className="fp-hero-lead">{slide.lead}</p>}
          {slide.paragraphs?.map((p) => (
            <p key={p.slice(0, 48)} className="fp-hero-text">
              {p}
            </p>
          ))}
        </div>
      )}
      {slide.blocks?.length > 0 && (
        <div className="fp-hero-blocks-grid">
          {slide.blocks.map((block) => (
            <div
              key={block.heading}
              className={`fp-hero-block${isWideBlock(block) ? " fp-hero-block--wide" : ""}`}
            >
              <h3 className="fp-hero-block-title">{block.heading}</h3>
              {block.text && <p className="fp-hero-block-text">{block.text}</p>}
              {block.subblocks?.length > 0 && (
                <div className="fp-hero-subblocks-grid">
                  {block.subblocks.map((sub) => (
                    <div key={sub.heading} className="fp-hero-subblock">
                      <h4 className="fp-hero-subblock-title">{sub.heading}</h4>
                      {sub.items?.length > 0 && (
                        <ul className="fp-hero-list">
                          {sub.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {block.listTitle && <p className="fp-hero-list-label">{block.listTitle}</p>}
              {block.items?.length > 0 && (
                <ul className="fp-hero-list">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {slide.closing && (
        <div className="fp-hero-closing">
          {slide.closing.title && <h3 className="fp-hero-block-title">{slide.closing.title}</h3>}
          {slide.closing.text && <p className="fp-hero-block-text">{slide.closing.text}</p>}
          {slide.closing.intro && <p className="fp-hero-block-text">{slide.closing.intro}</p>}
          {slide.closing.bullets?.length > 0 && (
            <ul className="fp-hero-list fp-hero-list--checks fp-hero-list--cols">
              {slide.closing.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {slide.closing.outro && <p className="fp-hero-block-text">{slide.closing.outro}</p>}
        </div>
      )}
    </div>
  );
}
