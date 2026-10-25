import React from 'react';

/*
 * Memecah teks menjadi huruf agar setiap huruf muncul satu per satu
 * dengan efek fade + blur yang lembut. Pembaca layar tetap membaca teks utuh.
 */
export default function SplitText({ text, as: Tag = 'span', className = '', delay = 0, stagger = 35 }) {
  const words = text.split(' ');
  let index = 0;

  return (
    <Tag className={`split-text ${className}`}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <React.Fragment key={`${word}-${wordIndex}`}>
            <span className="split-word">
              {Array.from(word).map((char, charIndex) => {
                const charDelay = delay + index * stagger;
                index += 1;
                return (
                  <span
                    key={charIndex}
                    className="split-char"
                    style={{ animationDelay: `${charDelay}ms` }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
            {wordIndex < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
}
