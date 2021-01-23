var express = require('express');
var router = express.Router();
const { isLogined, isNone } = require('../../lib/common');


// 견종 가져오기
router.get('', (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }

        let keyword = req.query.keyword;

        if (isNone(keyword)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // For DEV_DEBUG
        const breedList = [
            { b_id: 1, b_name: '불독', b_type: 'M' },
            { b_id: 2, b_name: '푸들', b_type: 'M' },
            { b_id: 3, b_name: '포메라니안', b_type: 'M' },
            { b_id: 4, b_name: '시베리안허스키', b_type: 'M' },
            { b_id: 5, b_name: '치와와', b_type: 'M' },
            { b_id: 6, b_name: '비숍', b_type: 'M' },
            { b_id: 7, b_name: '비숑프리제', b_type: 'M' },
            { b_id: 8, b_name: '비글', b_type: 'M' },
            { b_id: 9, b_name: '보스턴테리어', b_type: 'M' },
            { b_id: 10, b_name: '코카스파니엘', b_type: 'M' },
            { b_id: 11, b_name: '사모에드', b_type: 'M' },
            { b_id: 12, b_name: '스피츠', b_type: 'M' },
            { b_id: 13, b_name: '슈나우저', b_type: 'M' },
            { b_id: 14, b_name: '미니핀', b_type: 'M' },
            { b_id: 15, b_name: '말티즈', b_type: 'M' },
            { b_id: 16, b_name: '차우차우', b_type: 'M' },
            { b_id: 17, b_name: '진돗개', b_type: 'M' },
            { b_id: 18, b_name: '시바이누', b_type: 'M' },
            { b_id: 19, b_name: '요크셔테리어', b_type: 'M' },
            { b_id: 20, b_name: '골든리트리버', b_type: 'M' },
            { b_id: 21, b_name: '래브라도리트리버', b_type: 'M' },
            { b_id: 22, b_name: '셰퍼드', b_type: 'M' }
        ];

        res.json({ status: 'OK', result: breedList });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;