var express = require('express');
var router = express.Router();
const { isLogined } = require('../../lib/common');


// 기초접종 가져오기
router.get('', (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }
    
        // For DEV_DEBUG
        const inoculationList = [
            { in_id: 1, in_name: '종합백신(DHPPL)' },
            { in_id: 2, in_name: '코로나' },
            { in_id: 3, in_name: '켄넬코프' },
            { in_id: 4, in_name: '광견병' }
        ];
    
        res.json({ status: 'OK', result: inoculationList });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;