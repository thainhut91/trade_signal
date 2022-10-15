"use strict";

const NoiChuoi = function(kytu, chieudai){
    var chuoi = "";
    for(var i = 0 ; i< chieudai ; i++){
        chuoi = chuoi + kytu;
    }
    return chuoi;
}

const ChuyenDoiTinHieu = function(tinhieu){
    var tinhieudachuyendoi = "";
    for(var i = 0; i < tinhieu.length; i += 2){
        tinhieudachuyendoi = tinhieudachuyendoi + NoiChuoi(tinhieu[i+1], Number(tinhieu[i]));
    }
    return tinhieudachuyendoi;
}

const ChuyenDoiMangTinHieu = function(mangtinhieu, length){
    var tinhieudachuyendoi = '';
    var index = 0;
    mangtinhieu.forEach((tinhieu) => {
        if(index == length) return tinhieudachuyendoi;
        
        var cTinhieu = Number(tinhieu.result) == 1 ? 'b':'s';

        tinhieudachuyendoi = cTinhieu + tinhieudachuyendoi;

        index++;

    });
    return tinhieudachuyendoi;
}

module.exports = {
    ChuyenDoiTinHieu, ChuyenDoiMangTinHieu
}