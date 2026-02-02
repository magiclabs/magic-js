import { getPatternStyles, patternFns } from '../helpers.js';
import { css } from '../css/index.js';

const linkBoxConfig = {
transform(props) {
  return {
    position: "relative",
    "& :where(a, abbr)": {
      position: "relative",
      zIndex: "1"
    },
    ...props
  };
}}

export const getLinkBoxStyle = (styles = {}) => {
  const _styles = getPatternStyles(linkBoxConfig, styles)
  return linkBoxConfig.transform(_styles, patternFns)
}

export const linkBox = (styles) => css(getLinkBoxStyle(styles))
linkBox.raw = getLinkBoxStyle