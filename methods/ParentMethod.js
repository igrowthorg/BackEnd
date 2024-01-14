import pool from "../resource/db_connection.js";

export const ParentLogin = async(req, res, next) => {
    const {nic, password} = req.body;
    if(!nic || !password) {
        return res.status(400).json({
            message: 'Please fill all fields'
        })
    }
    try{
        const [rows] = await pool.query('SELECT guardian_nic, area_id, email FROM parent WHERE guardian_nic = ? AND password = ? LIMIT 1', [nic, password]);
        
        try{
            if(rows.length > 0) {
                req.session.parent = {guardian_nic: rows[0], area_id: rows[0].area_id };
                req.session.save();
                return res.status(200).json({
                    message: 'Login success',
                    data: req.session.parent.guardian_nic
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
        const [rows] = await pool.query('SELECT parent.*, parent.guardian_nic FROM parent inner join child on parent.guardian_nic = child.parent_id where parent.guardian_nic = ?', [req.session.parent.guardian_nic]);
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

export const GetChildByID = async(req, res, next) => {
    const {child_id} = req.params;
    try{
        const [rows] = await pool.query('SELECT * FROM child WHERE child_id = ?', [child_id]);
        if(rows.length < 1) return res.status(404).json({message: 'Child not found'})
        const {password, ...rest} = rows[0];
        return res.status(200).json(rest)
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const GetParentProfile = async (req, res, next) => {
    const guardian_nic = req.session.parent.guardian_nic.guardian_nic;

    try {
        let [rows] = await pool.query('SELECT parent.*, area.area_name FROM parent inner join area on parent.area_id = area.area_id WHERE parent.guardian_nic = ? LIMIT 1', [guardian_nic]);
        rows.forEach(row => {
            delete row.password;
        })
        return res.status(200).json(rows[0])
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const UpdateParentProfile = async (req, res, next) => {
    const guardian_nic = req.session.parent.guardian_nic.guardian_nic;
    const { motherName,fatherName,guardianName, phone, address,old_password, new_password } = req.body;

    if (new_password.length > 0 || old_password.length > 0) {
        if (!new_password || !old_password) {
            return res.status(400).json({
                message: 'you need provide old_password and new_password'
            })
        }

        if (new_password.trim().length < 6) {
            return res.status(400).json({
                message: 'password must be at least 6 characters'
            })
        }

        try {
            const [rows] = await pool.query('SELECT password FROM parent WHERE guardian_nic = ? LIMIT 1', [guardian_nic]);
            if (rows.length > 0) {
                if (rows[0].password !== old_password) {
                    return res.status(400).json({
                        message: 'Old password is incorrect'
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: 'Old password is incorrect'
                })
            }

        }
        catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }

        //  update data
        try {
            const [rows] = await pool.query('UPDATE parent SET mother_name = ?, father_name = ?, guardian_name = ?, phone = ?, address = ?, password = ? WHERE guardian_nic = ?', [motherName, fatherName, guardianName, phone, address, new_password, guardian_nic]);
            if (rows.affectedRows > 0) {
                return res.status(200).json({
                    message: 'Profile updated'
                })
            }
            else {
                return res.status(500).json({
                    message: 'Profile updating failed'
                })
            }
        }
        catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }
    else {
        // not update password
        try {
            const [rows] = await pool.query('UPDATE parent SET mother_name = ?, father_name = ?, guardian_name = ?, phone = ?, address = ? WHERE guardian_nic = ?', [motherName, fatherName, guardianName, phone, address, guardian_nic]);
            if (rows.affectedRows > 0) {
                return res.status(200).json({
                    message: 'Profile updated'
                })
            }
            else {
                return res.status(500).json({
                    message: 'Profile updating failed'
                })
            }
        }
        catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }
}

export const VaccineGetByChild = async(req, res, next) => {
    const { child_id} = req.params;

    if(!child_id){
        return res.status(400).json({
            message: 'Please add params child_id and vaccine_id',
        })
    }

    try{
        const [row] = await pool.query('SELECT taken_vaccine.* FROM taked_vaccine join child on taken_vaccine.child_id =child.child_id WHERE child_id=?', [child_id]);

        if(row.affectedRows > 0) {
            return res.status(200).json({
                message: 'Taken vaccines are displayed'
            })
        }
        else {
            return res.status(500).json({
                message: 'Display aken vaccines is failed'
            })
        }
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


// export const GetGrowthDetailsChart = async(req, res, next) => {
//     const { child_id } = req.params;

//     if(!child_id){
//         return res.status(400).json({
//             message: 'Please add params child_id',
//         })
//     }

//     try{
//         const [rows] = await pool.query('SELECT * FROM growth_detail WHERE child_id = ?', [child_id]);

//         if(rows.length < 1) return res.status(404).json({message: 'Child growth detail not found'})
        
//         let table_data = []

//         rows.forEach(row => {
//             let data = {
//                 month: row.month,
//                 weight: row.weight,
//             }
//             table_data.push(data)
//         })

//         return res.status(200).json(table_data)
//     }
//     catch(err) {
//         return res.status(500).json({
//             message: err.message
//         })
//     }
// }

export const AddDoneDevelopment = async(req,res,next)=>{
    const { child_id, activity_id } = req.params;

    if(!child_id || !activity_id){
        return res.status(400).json({
            message: 'Please add params child_id and vaccine_id',
        })
    }

    try{
        const [row] = await pool.query('INSERT INTO done_development(child_id, activity_id) VALUES (?, ?)', [child_id, activity_id]);

        if(row.affectedRows > 0) {
            return res.status(200).json({
                message: 'Done development activities are added'
            })
        }
        else {
            return res.status(500).json({
                message: 'Add done development activities is failed'
            })
        }
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const GetDevelopmentActivitiesForChild = async(req, res, next) => {
    const { child_id } = req.params;

    var Development_MAP = []

    if(!child_id){
        return res.status(400).json({
            message: 'Please add params child_id',
        })
    }

    try{
        let [all_developmentActivities] = await pool.query(`select development.*, done_development.* from done_development join development on development.activity_id=done_development.activity_id`);
        
        if(all_developmentActivities.length < 1) return res.status(404).json({message: 'Vaccine not found'})

        const [children] = await pool.query(`select *, TIMESTAMPDIFF(MONTH, child_birthday, CURDATE()) AS months_difference from child where child_id = ?`, [child_id]);
        
        if(children.length < 1) return res.status(404).json({message: 'Child not found'})

        const child = children[0];

        let[done_development] = await pool.query(`select * from done_development where child_id = ?`, [child_id]);

        // all_vaccine
        // child
        // take_vaccine

        all_developmentActivities.forEach(development => {

            let return_data = {
                activity_id: development.activity_id,
                activity_name: development.activity_name,
                activity_month: development.activity_name,
            }

            // Check whether the eligible for development
            const eligible = development.activity_month <= child.months_difference;
            console.log(development);
            // Check whether the vaccine has been taken
            const done = done_development.find(done => done.activity_id == development.activity_id);

            if(done) {
                return_data = {...return_data, status: "done"}
            }
            else if(eligible) {
                return_data = {...return_data, status: "eligible"}
            }
            else {
                return_data = {...return_data, status: "not_eligible"}
            }

            Development_MAP.push(return_data);
            
        })

        return res.status(200).json(Development_MAP)
    }
    catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
}