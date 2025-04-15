import fs from 'fs'

export function readJsonFile(path) {
	const json = fs.readFileSync(path, 'utf8')
	const data = JSON.parse(json)
	return data
}

export function writeJsonFile(path, data) {
    const json = JSON.stringify(data, null, 4)
    return new Promise((resolve, reject) => {
        fs.writeFile(path, json, err => {
            if (err) reject(err)
            resolve()
        })
    })
}

export function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}