import pool from "../resource/db_connection.js";

export const ParentLogin = async(req, res, next) => {
    const {nic, password} = req.body;
    if(!nic || !password) {
        return res.status(400).json({
            message: 'Please fill all fields'
        })
    }
    try{
        const [rows] = await pool.query('SELECT parent_id, area_id, email, nic FROM midwife WHERE nic = ? AND password = ? LIMIT 1', [nic, password]);
        
        try{
            if(rows.length > 0) {
                req.session.parent = {parent_id: rows[0], area_id: rows[0].area_id };
                req.session.save();
                return res.status(200).json({
                    message: 'Login success',
                    data: req.session.parent.parent_id
                })
            }
            else {
                return res.status(401).json({
                    message: 'Login failed'
                })
            }
        }
        catch(err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const ParentLogout = async(req, res, next) => {
    try{
        req.session.destroy();
        return res.status(200).json({
            message: 'Logout success'
        })
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const CheckParentAuth = async(req, res, next) => {
    if(req.session.parent) {
        return res.status(200).json({
            message: 'Authorized'
        })
    }
    else {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
}


export const GetAllChilds = async(req, res, next) => {
    try{
        const [rows] = await pool.query('SELECT parent.*, parent.parent_id FROM parent inner join child on parent.parent_id = child.parent_id where parent.parent_id = ?', [req.session.parent.parent_id]);
        const rests = rows.map((row) => {
            const { password, ...rest } = row;
            return rest;
        })
        return res.status(200).json(rests)
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }

}