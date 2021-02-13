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

        let tab = req.query.tab; // SIMILAR, OTHER
        let category = req.query.category; // ALL FEED SUPPLEMENT SNACK
        let filter = req.query.filter; // PALA BENE COST SIDE RCNT BEST

        let pcId = req.query.pcId;
        let keyword = req.query.keyword;

        if (isNone(pcId)) {
            pcId = 'ALL';
        }


        let query = "SET SESSION group_concat_max_len = 65535";
        let [result, fields] = await pool.query(query);
        
        let params = [];

        query = "SELECT pTab.*, pbTab.*, fnTab.*,";

        query += " IFNULL(";
        query += " (SELECT GROUP_CONCAT(iTab.i_path SEPARATOR '|')";
        query += " FROM t_images AS iTab";
        query += " WHERE iTab.i_type = 'IMAGE' AND iTab.i_data_type = 'product' AND iTab.i_target_id = pTab.p_id)";
        query += " , '') AS pImages,";

        query += " IFNULL(";
        query += " (SELECT GROUP_CONCAT(iTab.i_path SEPARATOR '|')";
        query += " FROM t_images AS iTab";
        query += " WHERE iTab.i_type = 'IMAGE_DETAIL' AND iTab.i_data_type = 'product' AND iTab.i_target_id = pTab.p_id)";
        query += " , '') AS pDetailImages";

        query += " FROM t_products AS pTab";

        query += " JOIN t_product_brands AS pbTab ON pbTab.pb_id = pTab.p_pb_id";

        query += " LEFT JOIN t_feed_nutrients AS fnTab ON fnTab.fn_p_id = pTab.p_id";

        query += " WHERE 1 = 1";

        if (pcId != 'ALL') {
            query += " AND pTab.p_pc_id = ?";
            params.push(pcId);
        }

        if (!isNone(keyword)) {
            query += " AND pTab.p_keyword LIKE ?";
            params.push(`%${keyword}%`);
        }

        [result, fields] = await pool.query(query, params);

        res.json({ status: 'OK', result: result });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;