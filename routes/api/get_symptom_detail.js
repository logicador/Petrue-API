var express = require('express');
var router = express.Router();
const { isLogined, isNone } = require('../../lib/common');
const pool = require('../../lib/database');


// 증상 가져오기
router.get('', async (req, res) => {
    try {
        // if (!isLogined(req.session)) {
        //     res.json({ status: 'ERR_NO_PERMISSION' });
        //     return;
        // }

        let uId = req.session.uId;
        let sId = req.query.sId;

        if (isNone(sId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }


        let query = "SELECT sTab.*,";
        query += " IFNULL((SELECT GROUP_CONCAT(msnf_target_id SEPARATOR '|') FROM t_maps_symptom_nutrient_food WHERE msnf_type LIKE 'FOOD' AND msnf_s_id = sTab.s_id), '') AS msnfs,";
        query += " IFNULL((SELECT GROUP_CONCAT(msd_d_id SEPARATOR '|') FROM t_maps_symptom_disease WHERE msd_s_id = sTab.s_id), '') AS msds";
        query += " FROM t_symptoms AS sTab WHERE sTab.s_id = ?";
        let params = [sId];

        let [result, fields] = await pool.query(query, params);

        if (result.length == 0) {
            res.json({ status: 'ERR_NO_SYMPTOM' });
            return;
        }

        let symptom = result[0];

        let foodIdList = (symptom.msnfs == '') ? [] : symptom.msnfs.split('|');
        let diseaseIdList = (symptom.msds == '') ? [] : symptom.msds.split('|');

        let foodList = [];
        let diseaseList = [];

        if (foodIdList.length > 0) {
            query = "SELECT * FROM t_foods WHERE f_id IN (";
            params = [];
            for (let i = 0; i < foodIdList.length; i++) {
                if (i > 0) query += " ,";
                query += " ?";
                params.push(foodIdList[i]);
            }
            query += " )";
            [result, fields] = await pool.query(query, params);
            foodList = result;
        }

        if (diseaseIdList.length > 0) {
            query = "SELECT * FROM t_diseases WHERE d_id IN (";
            params = [];
            for (let i = 0; i < diseaseIdList.length; i++) {
                if (i > 0) query += " ,";
                query += " ?";
                params.push(diseaseIdList[i]);
            }
            query += " )";
            [result, fields] = await pool.query(query, params);
            diseaseList = result;
        }

        // TODO: 질병결과 > 유사견들이 젤 많이 걸린 질병 5개 나열 (similarCnt, cnt 필요)

        res.json({ status: 'OK', result: {
            symptom: symptom,
            foodList: foodList,
            diseaseList: diseaseList
        }});

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;
