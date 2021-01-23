var express = require('express');
var router = express.Router();
const { isLogined } = require('../../lib/common');


// 제품 검색
router.get('', (req, res) => {
    try {
        if (!isLogined(req.session)) {
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

    } catch(error) {
        console.log(error);
        res.json({ status: 'ERR_INTERNAR_SERVER' });
    }
});


module.exports = router;