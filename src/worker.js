const workercode = ()=> {
    let sheet, errs, vals;
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = ({data}) => {
        // eslint-disable-next-line no-restricted-globals
        console.log(data)
        sheet  = data
        vals = {}
        errs = {}

        for (const coord in sheet) {
            ['', '$'].map(p => [coord, coord.toLocaleLowerCase()].map(c => {
                const name = p + c
                // eslint-disable-next-line no-restricted-globals
                if ((Object.getOwnPropertyDescriptor(self, name) || {}).get) {
                    return;
                }

                // eslint-disable-next-line no-restricted-globals
                Object.defineProperty(self, name, {
                    get() {
                        if (coord in vals) {
                            return vals[coord];
                        }
                        vals[coord] = NaN

                        let x = +sheet[coord]
                        if (sheet[coord] !== x.toString()) {
                            x = sheet[coord]
                        }

                        try {
                            vals[coord] = (('=' === x[0]) ? eval.call(null, x.slice(1)) : x)
                        } catch (e) {
                            const match = /\$?[A-Za-z]+[1-9][0-9]*\b/.exec(e);
                            if (match && !(match[0] in this)) {
                                this[match[0]] = 0;
                                delete vals[coord]
                                return this[coord]
                            }
                            errs[coord] = e.toString()
                        }
                        switch (typeof vals[coord]) {
                            case 'function':
                            case 'object':
                                vals[coord] += ''
                        }

                        return vals[coord]
                    }
                })
            }))
        }

        for (const coord in sheet) {
            // eslint-disable-next-line no-restricted-globals
            let t = self[coord]
        }
        postMessage([errs, vals])
    }
}

let code = workercode.toString()
code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"))
const blob = new Blob([code], {type:'application/javascript'})
const worker_script = URL.createObjectURL(blob)
export default worker_script
