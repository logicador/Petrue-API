var express = require('express');
var router = express.Router();
const { isLogined, isNone, isInt } = require('../../lib/common');
const pool = require('../../lib/database');


// 제품 검색
router.get('', async (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }

        let pcId = req.query.pcId;
        let keyword = req.query.keyword;

        if (isNone(keyword) || isNone(pcId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        if (!isInt(pcId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        
        let query = "SELECT * FROM t_products AS pTab";
        if (pcId == 1) {
            // 사료
            query += " JOIN t_feed_nutrients AS fnTab ON fnTab.fn_p_id = pTab.p_id";
        }
        query += " WHERE pTab.p_pc_id = ? AND pTab.p_keyword LIKE ?";
        let params = [pcId, `%${keyword}%`];
        let [result, fields] = await pool.query(query, params);

        res.json({ status: 'OK', result: result });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;