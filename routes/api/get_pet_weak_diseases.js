var express = require('express');
var router = express.Router();
const { isLogined } = require('../../lib/common');
const pool = require('../../lib/database');


router.get('', async (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }

        let uId = req.session.uId;
        let peId = req.query.peId;

        let query = "SELECT * FROM t_pets WHERE pe_u_id = ? AND pe_id = ?";
        let params = [uId, peId];


        // 유사견 리스트 뽑기 > 취약질병 10순위 뽑기 - 긍정성분 산출 (유사견 기준)
        query = "SELECT *,";

        query += " IFNULL(";
        query += " (SELECT GROUP_CONCAT(mpedTab.mped_d_id SEPARATOR '|')";
        query += " FROM t_maps_pet_disease AS mpedTab";
        query += " WHERE mpedTab.mped_pe_id = peTab.pe_id)";
        query += " , '') AS mpeds";

        query += " FROM t_pets AS peTab";

        // 유사견 > 견종, 출생일 +- 1년, 신체지수, 성별
        query += " WHERE peTab.pe_b_id = ? AND peTab.pe_birth >= ? AND peTab.pe_birth <= ?";
        query += " AND peTab.pe_bcs = ? AND peTab.pe_gender = ?";
        params = [pet.pe_b_id, pet.pe_birth - 10000, pet.pe_birth + 10000, pet.pe_bcs, pet.pe_gender];
        [result, fields] = await pool.query(query, params);

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAL_SERVER' });
    }
});


module.exports = router;