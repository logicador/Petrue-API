var express = require('express');
var router = express.Router();
const { isLogined, isNone } = require('../../lib/common');


// 알러지 가져오기 allergy
router.get('', (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }
    
        let fc1Id = req.query.fc1Id;
    
        if (isNone(fc1Id)) {
            fc1Id = 'ALL';
        }
    
        const fcList = [
            {fc1_id: 1, fc1_name: '육류', fc2List: [
                {fc2_id: 1, fc2_name: '닭'},
                {fc2_id: 2, fc2_name: '돼지'},
                {fc2_id: 3, fc2_name: '소'},
                {fc2_id: 4, fc2_name: '양'},
                {fc2_id: 5, fc2_name: '토끼'},
                {fc2_id: 6, fc2_name: '오리'},
                {fc2_id: 7, fc2_name: '칠면조'},
                {fc2_id: 8, fc2_name: '기타육류'}
            ]},
            {fc1_id: 2, fc1_name: '과채류', fc2List: [
                {fc2_id: 9, fc2_name: '닭'},
                {fc2_id: 10, fc2_name: '돼지'},
                {fc2_id: 11, fc2_name: '소'},
                {fc2_id: 12, fc2_name: '양'},
                {fc2_id: 13, fc2_name: '토끼'},
                {fc2_id: 14, fc2_name: '오리'},
                {fc2_id: 15, fc2_name: '칠면조'},
                {fc2_id: 16, fc2_name: '기타육류'}
            ]},
            {fc1_id: 3, fc1_name: '곡물 및 견과류', fc2List: [
                {fc2_id: 17, fc2_name: '닭'},
                {fc2_id: 18, fc2_name: '돼지'},
                {fc2_id: 19, fc2_name: '소'},
                {fc2_id: 20, fc2_name: '양'},
                {fc2_id: 21, fc2_name: '토끼'},
                {fc2_id: 22, fc2_name: '오리'},
                {fc2_id: 23, fc2_name: '칠면조'},
                {fc2_id: 24, fc2_name: '기타육류'}
            ]},
            {fc1_id: 4, fc1_name: '유제품 및 계란', fc2List: [
                {fc2_id: 25, fc2_name: '닭'},
                {fc2_id: 26, fc2_name: '돼지'},
                {fc2_id: 27, fc2_name: '소'},
                {fc2_id: 28, fc2_name: '양'},
                {fc2_id: 29, fc2_name: '토끼'},
                {fc2_id: 30, fc2_name: '오리'},
                {fc2_id: 31, fc2_name: '칠면조'},
                {fc2_id: 32, fc2_name: '기타육류'}
            ]},
            {fc1_id: 5, fc1_name: '해산물', fc2List: [
                {fc2_id: 33, fc2_name: '닭'},
                {fc2_id: 34, fc2_name: '돼지'},
                {fc2_id: 35, fc2_name: '소'},
                {fc2_id: 36, fc2_name: '양'},
                {fc2_id: 37, fc2_name: '토끼'},
                {fc2_id: 38, fc2_name: '오리'},
                {fc2_id: 39, fc2_name: '칠면조'},
                {fc2_id: 40, fc2_name: '기타육류'}
            ]},
            {fc1_id: 6, fc1_name: '기타', fc2List: [
                {fc2_id: 41, fc2_name: '닭'},
                {fc2_id: 42, fc2_name: '돼지'},
                {fc2_id: 43, fc2_name: '소'},
                {fc2_id: 44, fc2_name: '양'},
                {fc2_id: 45, fc2_name: '토끼'},
                {fc2_id: 46, fc2_name: '오리'},
                {fc2_id: 47, fc2_name: '칠면조'},
                {fc2_id: 48, fc2_name: '기타육류'}
            ]}
        ];
    
        res.json({ status: 'OK', result: fcList });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;