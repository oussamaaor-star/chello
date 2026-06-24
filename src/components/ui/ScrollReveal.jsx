import { motion } from 'motion/react';
import { fadeUp } from '../../lib/motion';

export function ScrollReveal({ children, variants = fadeUp, className, as = 'div', ...props }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}
