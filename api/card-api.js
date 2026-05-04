import { BASE_PATH } from '../constants/constants.js';

function getCardDetail(matrix) {
  if (!matrix) return null;
  return `${BASE_PATH}/getVikingCardByPath;path=${matrix};cb`;
}

export { getCardDetail };