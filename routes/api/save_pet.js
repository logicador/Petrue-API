var express = require('express');
var router = express.Router();
const { isNone, isLogined, ntb, isValidStrLength, 
    isInt, getByteLength, getJSONList } = require('../../lib/common');
var fs = require('fs');
const pool = require('../../lib/database');


// 펫 저장 (추가/수정)
router.post('', async (req, res) => {
    try {
        if (!isLogined(req.session)) {
            res.json({ status: 'ERR_NO_PERMISSION' });
            return;
        }

        let peId = req.body.peId;
        let thumbnail = ntb(req.body.thumbnail);
        let name = req.body.name; // length
        let birth = req.body.birth; // number
        let bId = req.body.bId; // number
        let gender = req.body.gender; // M F
        let weight = req.body.weight; // null float(double)
        let bcs = req.body.bcs; // number
        let neuter = req.body.neuter; // Y N D
        let inoculation = req.body.inoculation; // Y N D
        let inoculationText = ntb(req.body.inoculationText); // null
        let serial = req.body.serial; // Y N D
        let serialNo = ntb(req.body.serialNo); // null
        let feedPId = req.body.feedPId; // null number
        let snackPId = req.body.snackPId; // null number

        let inoculationIdList = req.body.inoculationIdList; // null
        let diesaseIdList = req.body.diesaseIdList; // null
        let allergyIdList = req.body.allergyIdList; // null

        let query = "";
        let params = [];
        let [result, fields] = [null, null];

        // 필수값 체크
        if (isNone(name) || isNone(birth) || isNone(bId) || isNone(gender) || 
            isNone(bcs) || isNone(neuter) || isNone(inoculation) || isNone(serial)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 숫자 체크
        if (!isInt(birth)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (!isInt(bId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (!isInt(bcs)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (!isNone(feedPId) && !isInt(feedPId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (!isNone(snackPId) && !isInt(snackPId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (!isNone(peId) && !isInt(peId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 성별 체크
        if (gender != 'M' && gender != 'F') {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // Y N D 체크
        if (neuter != 'Y' && neuter != 'N' && neuter != 'D') {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (inoculation != 'Y' && inoculation != 'N' && inoculation != 'D') {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (serial != 'Y' && serial != 'N' && serial != 'D') {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // bcs 유효성 체크 (1~5)
        if (parseInt(bcs) < 1 || parseInt(bcs) > 5) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 이름 길이 1 - 8자 (12자)
        if (!isValidStrLength(10, 1, 8, name)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 생일 유효성 체크
        let birthRegExp = /^[0-9]{8}$/;
        if (!birthRegExp.test(birth)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        
        // 연월일 자르기
        let splitBirthYear = birth.substring(0, 4);
        let splitBirthMonth = birth.substring(4, 6);
        let splitBirthDay = birth.substring(6, 8);
        // Date로 Convert
        let convertDate = new Date(splitBirthYear, (parseInt(splitBirthMonth) - 1), splitBirthDay);
        let convertYear = convertDate.getFullYear();
        let convertMonth = convertDate.getMonth() + 1;
        let convertDay = convertDate.getDate();
        // 계산 위한 Int 형변환
        let birthYear = parseInt(splitBirthYear);
        let birthMonth = parseInt(splitBirthMonth);
        let birthDay = parseInt(splitBirthDay);

        // 입력된 날짜가 유효한지 (Date로 변경해서 입력한 날짜랑 같은지)
        if (birthYear != convertYear || birthMonth != convertMonth || birthDay != convertDay) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 오늘 날짜 이후인지 체크
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();
        if (year < birthYear) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (year == birthYear && month < birthMonth) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }
        if (year == birthYear && month == birthMonth && day < birthDay) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 몸무게 유효성 체크
        if (!isNone(weight)) {
            weight = parseFloat(weight);
            if (isNaN(weight)) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
            if (weight > 999) {
                res.json({ status: 'ERR_WRONG_PARAMS' });
                return;
            }
            weight = weight.toFixed(2);
        }

        // 시리얼넘버 길이 체크 최대 20(30)
        if (!isNone(serialNo) && (getByteLength(serialNo) > 60 || serialNo.length > 30)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // 기초접종 직접입력 길이 체크 최대 30(50)
        if (!isNone(inoculationText) && (getByteLength(inoculationText) > 90 || inoculationText.length > 50)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // thumbnail에 내 uId가 정상적으로 포함되어있는지
        let uId = req.session.uId;
        if (thumbnail != '' && !thumbnail.includes(uId)) {
            res.json({ status: 'ERR_WRONG_PARAMS' });
            return;
        }

        // breed 존재하는지 체크 (SKIP For DEV_DEBUG)
        // query = "SELECT * FROM t_breeds WHERE b_id = ?";
        // params = [bId];
        // [result, fields] = await pool.query(query, params);
        // if (result.length == 0) {
        //     res.json({ status: 'ERR_NO_BREED' });
        //     return;
        // }

        // product 존재하는지 체크 (SKIP For DEV_DEBUG)
        // params = [];
        // if (!isNone(feedPId)) params.push(feedPId);
        // if (!isNone(snackPId)) params.push(snackPId);
        // if (params.length > 0) {
        //     query = "SELECT * FROM t_products WHERE p_id = ?";
        //     if (params.length > 1) query += " OR p_id = ?";
        //     [result, fields] = await pool.query(query, params);
        //     if (result.length != params.length) {
        //         res.json({ status: 'ERR_NO_PRODUCT' });
        //         return;
        //     }
        // }

        inoculationIdList = getJSONList(inoculationIdList);
        diesaseIdList = getJSONList(diesaseIdList);
        allergyIdList = getJSONList(allergyIdList);

        // 추가인지 수정인지
        if (isNone(peId)) {
            // INSERT
            query = "INSERT INTO t_pets (pe_u_id, pe_b_id, pe_name, pe_thumbnail, pe_birth, pe_bcs, pe_gender,";
            query += " pe_neuter, pe_inoculation, pe_inoculation_text, pe_serial, pe_serial_no, pe_weight)";
            query += " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            params = [uId, bId, name, thumbnail, birth, bcs, gender, neuter, inoculation, inoculationText, serial, serialNo, weight];
            [result, fields] = await pool.query(query, params);

            peId = result.insertId;

        } else {

            // 펫 수정 권한 체크
            query = "SELECT * FROM t_pets WHERE pe_id = ? AND pe_u_id = ?";
            params = [peId, uId];
            [result, fields] = await pool.query(query, params);
            if (result.length == 0) {
                res.json({ status: 'ERR_NO_PERMISSION' });
                return;
            }

            // 썸네일 수정함 (기존 파일 삭제)
            let originalThumbnail = result[0].pe_thumbnail;
            if (thumbnail != originalThumbnail) {
                if (fs.existsSync('public' + originalThumbnail)) {
                    fs.unlinkSync('public' + originalThumbnail);
                    let imageName = originalThumbnail.replace('/images/users/' + uId + '/', '');
                    if (fs.existsSync('public/images/users/' + uId + '/original/' + imageName)) {
                        fs.unlinkSync('public/images/users/' + uId + '/original/' + imageName);
                    }
                }
            }

            // UPDATE
            query = "UPDATE t_pets SET pe_b_id = ?, pe_name = ?, pe_thumbnail = ?, pe_birth = ?, pe_bcs = ?, pe_gender = ?,";
            query += " pe_neuter = ?, pe_inoculation = ?, pe_inoculation_text = ?, pe_serial = ?, pe_serial_no = ?, pe_weight = ?";
            query += " WHERE pe_id = ?";
            params = [bId, name, thumbnail, birth, bcs, gender, neuter, inoculation, inoculationText, serial, serialNo, weight, peId];
            [result, fields] = await pool.query(query, params);
        }

        peId = parseInt(peId); // for IOS data decode
        res.json({ status: 'OK', result: peId });

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAL_SERVER' });
    }
});


module.exports = router;