var express = require('express');
var router = express.Router();
const { isNone } = require('../../lib/common');
var fs = require('fs');
const pool = require('../../lib/database');


// 로그인
router.post('', async (req, res) => {
    try {
        let registType = req.body.registType;
        let email = req.body.email;
        let password = req.body.password;

        if (isNone(registType)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // reigstType 체크 (EMAIL, KAKAO, NAVER, APPLE)
        if (registType != 'EMAIL' && registType != 'KAKAO' && registType != 'NAVER' && registType != 'APPLE') {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
    
        let query = "";
        let params = [];
        let [result, fields] = [null, null];
    
        let user = null;
    
        // 이메일 로그인이라면
        if (registType == 'EMAIL') {
            if (isNone(email) || isNone(password)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
    
            query = "SELECT *, IFNULL(peTab.cnt, 0) AS petCnt FROM t_users AS uTab LEFT JOIN";
            query += " (SELECT pe_u_id, COUNT(*) AS cnt FROM t_pets GROUP BY pe_u_id) AS peTab";
            query += " ON uTab.u_id = peTab.pe_u_id WHERE uTab.u_email = ? AND uTab.u_password = ?";
            params = [email, password];
            [result, fields] = await pool.query(query, params);
    
            if (result.length == 0) {
                res.json({ status: 'LOGIN_FAILED' });
                return;
            }
    
            user = result[0];
        }

        // 상태 업데이트
        query = "UPDATE t_users SET u_is_logined = 'Y', u_connected_date = NOW() WHERE u_id = ?";
        params = [user.u_id];
        [result, fields] = await pool.query(query, params);
    
        if (!fs.existsSync(`public/images/users/${user.u_id}`)) {
            fs.mkdirSync(`public/images/users/${user.u_id}`);
        }
        if (!fs.existsSync(`public/images/users/${user.u_id}/original`)) {
            fs.mkdirSync(`public/images/users/${user.u_id}/original`);
        }
    
        req.session.isLogined = true;
        req.session.uId = user.u_id;
        req.session.uEmail = user.u_email;
        req.session.uRegistType = user.u_regist_type;
        req.session.uSocialId = user.u_social_id;
        req.session.save(() => {
            res.json({ status: 'OK', result: user });
        });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;