var express = require('express');
var router = express.Router();
const { isNone, getByteLength, generateRandomId, isValidStrLength } = require('../../lib/common');
var fs = require('fs');
const pool = require('../../lib/database');


// 회원가입
router.post('', async (req, res) => {
    try {
        let registType = req.body.registType;
        let email = req.body.email;
        let password = req.body.password;
        let nickName = req.body.nickName;
    
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
    
        // 이메일 회원가입일 경우
        if (registType == 'EMAIL') {
            if (isNone(email) || isNone(password) || isNone(nickName)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
    
            let emailRegExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,32}$/i;
            if (!emailRegExp.test(email)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
    
            let passwordRegExp = /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*[!@#$%^&+=]).{8,16}$/;
            if (!passwordRegExp.test(password)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }

            // 닉네임 길이 체크 1-8(16)
            if (!isValidStrLength(16, 1, 8, nickName)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
    
            query = "SELECT * FROM t_users WHERE u_email = ?";
            params = [email];
            [result, fields] = await pool.query(query, params);
    
            if (result.length > 0) {
                res.json({ status: 'EXISTS_EMAIL' });
                return;
            }
    
            query = "SELECT * FROM t_users WHERE u_nick_name = ?";
            params = [nickName];
            [result, fields] = await pool.query(query, params);
    
            if (result.length > 0) {
                res.json({ status: 'EXISTS_NICK_NAME' });
                return;
            }
    
            uId = generateRandomId();
            query = "INSERT INTO t_users (u_id, u_regist_type, u_email, u_password, u_nick_name)";
            query += " VALUES (?, ?, ?, ?, ?)";
            params = [uId, registType, email, password, nickName];
            [result, fields] = await pool.query(query, params);
        }
    
        if (!fs.existsSync(`public/images/users/${uId}`)) {
            fs.mkdirSync(`public/images/users/${uId}`);
        }
        if (!fs.existsSync(`public/images/users/${uId}/original`)) {
            fs.mkdirSync(`public/images/users/${uId}/original`);
        }
    
        res.json({ status: 'OK', result: uId });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;