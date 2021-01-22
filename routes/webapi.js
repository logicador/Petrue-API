var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var sharp = require('sharp');
var fs = require('fs');
var imageSize = require('image-size');
const pool = require('../lib/database');


// 회원가입
router.post('/join', async (req, res) => {
    let registType = req.body.registType;
    let email = req.body.email;
    let password = req.body.password;
    let nickName = req.body.nickName;

    if (f.isNone(registType)) {
        res.json({ status: 'ERR_WRONG_PARAMS' });
        return;
    }

    let query = "";
    let params = [];
    let [result, fields] = [null, null];

    // 이메일 회원가입일 경우
    if (registType == 'EMAIL') {
        if (f.isNone(email) || f.isNone(password) || f.isNone(nickName)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        let emailRegExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,32}$/i;
        if (!emailRegExp.test(email)) {
            res.json({ status: 'ERR_WRONG_EMAIL' });
            return;
        }

        let passwordRegExp = /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*[!@#$%^&+=]).{8,16}$/;
        if (!passwordRegExp.test(password)) {
            res.json({ status: 'ERR_WRONG_PASSWORD' });
            return;
        }

        if (f.getByteLength(nickName) < 4 || f.getByteLength(nickName) > 12) {
            res.json({ status: 'ERR_WRONG_NICK_NAME' });
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

        uId = f.generateRandomId();
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
});


// 로그인
router.post('/login', async (req, res) => {

    let registType = req.body.registType;
    let email = req.body.email;
    let password = req.body.password;

    if (f.isNone(registType)) {
        res.json({ status: 'ERR_WRONG_PARAMS' });
        return;
    }

    let query = "";
    let params = [];
    let [result, fields] = [null, null];

    let user = null;

    // 이메일 로그인이라면
    if (registType == 'EMAIL') {
        if (f.isNone(email) || f.isNone(password)) {
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
});


// 견종 가져오기
router.get('/get/breeds', (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    let keyword = req.query.keyword;

    if (f.isNone(keyword)) {
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
});


// 기초접종 가져오기
router.get('/get/inoculations', (req, res) => {
    if (!f.isLogined(req.session)) {
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
});


// 사료 검색 (사료만 따로 / t_feed_nutrients 때문)
router.get('/get/feeds', (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    const feedList = [
        {p_id: 1, p_pc_id: 1, p_pb_id: 1, p_name: '브이플래닛 비건사료', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 2, p_pc_id: 1, p_pb_id: 1, p_name: '프론티어 동결건조사료', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 3, p_pc_id: 1, p_pb_id: 1, p_name: '펄포즈', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 4, p_pc_id: 1, p_pb_id: 1, p_name: '스티브 리얼푸드', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 5, p_pc_id: 1, p_pb_id: 1, p_name: '빅스비 러블', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 6, p_pc_id: 1, p_pb_id: 1, p_name: '빅독', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 7, p_pc_id: 1, p_pb_id: 1, p_name: '네추럴코어', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 8, p_pc_id: 1, p_pb_id: 1, p_name: '알파스피릿 뉴에디션', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 9, p_pc_id: 1, p_pb_id: 1, p_name: '프라이멀', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 10, p_pc_id: 1, p_pb_id: 1, p_name: '노스웨스트 내추럴', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 11, p_pc_id: 1, p_pb_id: 1, p_name: '워프 염소고기', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 12, p_pc_id: 1, p_pb_id: 1, p_name: '워프 양고기', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 13, p_pc_id: 1, p_pb_id: 1, p_name: '멍키친', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 14, p_pc_id: 1, p_pb_id: 1, p_name: '노스웨스트', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 15, p_pc_id: 1, p_pb_id: 1, p_name: '브이플래닛', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 16, p_pc_id: 1, p_pb_id: 1, p_name: '벨포아 인섹트', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 17, p_pc_id: 1, p_pb_id: 1, p_name: '비고앤세이지 독', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 18, p_pc_id: 1, p_pb_id: 1, p_name: '브레이버리', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0}
    ];
    res.json({ status: 'OK', result: feedList });
});


// 제품 검색
router.get('/get/products', (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    const feedList = [
        {p_id: 1, p_pc_id: 1, p_pb_id: 1, p_name: '브이플래닛 비건사료', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 2, p_pc_id: 1, p_pb_id: 1, p_name: '프론티어 동결건조사료', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 3, p_pc_id: 1, p_pb_id: 1, p_name: '펄포즈', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 4, p_pc_id: 1, p_pb_id: 1, p_name: '스티브 리얼푸드', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 5, p_pc_id: 1, p_pb_id: 1, p_name: '빅스비 러블', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 6, p_pc_id: 1, p_pb_id: 1, p_name: '빅독', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 7, p_pc_id: 1, p_pb_id: 1, p_name: '네추럴코어', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 8, p_pc_id: 1, p_pb_id: 1, p_name: '알파스피릿 뉴에디션', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 9, p_pc_id: 1, p_pb_id: 1, p_name: '프라이멀', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 10, p_pc_id: 1, p_pb_id: 1, p_name: '노스웨스트 내추럴', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 11, p_pc_id: 1, p_pb_id: 1, p_name: '워프 염소고기', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 12, p_pc_id: 1, p_pb_id: 1, p_name: '워프 양고기', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 13, p_pc_id: 1, p_pb_id: 1, p_name: '멍키친', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 14, p_pc_id: 1, p_pb_id: 1, p_name: '노스웨스트', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 15, p_pc_id: 1, p_pb_id: 1, p_name: '브이플래닛', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 16, p_pc_id: 1, p_pb_id: 1, p_name: '벨포아 인섹트', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 17, p_pc_id: 1, p_pb_id: 1, p_name: '비고앤세이지 독', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0},
        {p_id: 18, p_pc_id: 1, p_pb_id: 1, p_name: '브레이버리', p_price: 10000,
        p_thumbnail: '', p_origin: '', p_manufacturer: '', p_packing_volume: '',
        p_recomended: '', p_total_score: 3.5, fn_id: 1, fn_prot: 4.5, fn_fat: 5.5,
        fn_fibe: 7.0, fn_ash: 12.2, fn_calc: 5.5, fn_phos: 6.0, fn_mois: 2.0}
    ];
    res.json({ status: 'OK', result: feedList });
});


// 질병 가져오기
router.get('/get/diseases', async (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    let bpId = req.query.bpId;

    if (f.isNone(bpId)) {
        bpId = 'ALL';
    }

    let query = "SELECT * FROM t_diseases";
    let params = [];

    if (bpId != 'ALL') {
        query += " WHERE d_bp_id = ?";
        params.push(bpId);
    }

    let [result, fields] = await pool.query(query, params);

    res.json({ status: 'OK', result: result });
});


// 알러지 가져오기 allergy
router.get('/get/food/categories', (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    let fc1Id = req.query.fc1Id;

    if (f.isNone(fc1Id)) {
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
});


// 이미지 업로드
router.post('/upload/image', (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = 'upload/tmp';
    form.multiples = true;
    form.keepExtensions = true;

    let uId = req.session.uId;

    form.parse(req, (error, body, files) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_UPLOAD' });
            return;
        }

        let imageName = f.generateRandomId();

        // 이미지 프로세싱
        let imagePath = `public/images/users/${uId}/${imageName}.jpg`;
        let originalImagePath = `public/images/users/${uId}/original/${imageName}.jpg`;
        fs.rename(files.image.path, imagePath, () => {
            fs.copyFile(imagePath, originalImagePath, async () => {

                let originalWidth = imageSize(originalImagePath).width;
                let rw = 0;
                while (true) {
                    if (fs.statSync(imagePath).size > 100000) {
                        rw += 2;
                        await sharp(originalImagePath)
                            .resize({ width: parseInt(originalWidth * ((100 - rw) / 100)) })
                            .toFile(imagePath);
                    } else { break; }
                }

                res.json({ status: 'OK', result: parseInt(imageName) });
            });
        });
    });
});


// 펫 추가
router.post('/add/pet', async (req, res) => {
    if (!f.isLogined(req.session)) {
        res.json({ status: 'ERR_NO_PERMISSION' });
        return;
    }

    let registType = req.body.registType;
    let email = req.body.email;
    let password = req.body.password;
    let nickName = req.body.nickName;

});


module.exports = router;
