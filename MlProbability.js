module.exports = (db) => {

    const checkIfExist = async (data) => {
        const results = await db.all('SELECT * FROM ml WHERE classname = ?', data.cropClassName);
        if (results.length === 0) {
            await db.run('INSERT INTO ml (user_name, crop_type, feedback, classname) VALUES (?, ?, ?, ?)',
                data.userName, data.cropType, data.cropProbality, data.cropClassName);
            const mlFeedback = await db.get('SELECT * FROM ml WHERE classname = ?', data.cropClassName);
            // console.log(mlFeedback);
            return { isExists: true, mlFeedback };
        } else {
            return { isExists: false };
        }
    }

    return {
        checkIfExist
    }
}