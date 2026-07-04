const { check, done } = require('./t.js');
const screens = require('../js/screens.js');

check('init is function', typeof screens.init === 'function');
check('show is function', typeof screens.show === 'function');
check('hide is function', typeof screens.hide === 'function');
check('showTask is function', typeof screens.showTask === 'function');
check('markWrong is function', typeof screens.markWrong === 'function');
check('markCorrect is function', typeof screens.markCorrect === 'function');
check('hideTask is function', typeof screens.hideTask === 'function');
check('showHUD is function', typeof screens.showHUD === 'function');
check('updateHUD is function', typeof screens.updateHUD === 'function');
check('hideHUD is function', typeof screens.hideHUD === 'function');

done();
