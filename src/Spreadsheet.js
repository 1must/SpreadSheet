import React from 'react';
import './Spreadsheet.css';
import worker_script from './worker'

class SpreadSheet extends React.Component{
    constructor(props){
        super(props)
        let col = Array.from({length:8}).map((a,i)=>String.fromCharCode('A'.charCodeAt(0)+i))
        let row = Array.from({length:20}).map((a,i)=>i+1)
        this.sheet = {}
        this.state = {
            col,
            row,
            sheet:{},
            vals: {},
            errs:{}
        }
        this.worker = new Worker(worker_script)
        console.log('worker_script', worker_script)
        console.log(this.worker)

    }

    reset = ()=> {
        this.setState({
            sheet:{},
            errs:{},
            vals:{}
        })
    }


    debounce = (func, time)=>{
        let timer = null
        return (...args)=>{
            clearTimeout(timer)
            timer = setTimeout(()=>{func.apply(this, args)}, time)
        }
    }

    calc=()=>{
        const {sheet} = this.state
        const json = JSON.stringify(sheet)
        const promise = setTimeout(()=>{
            console.log('over time')
            this.worker.terminate()
            let storedSheet = JSON.parse(localStorage.getItem(''))
            if(!storedSheet) this.reset()
            else this.setState({sheet:storedSheet})
            this.worker = new Worker(worker_script)
            this.calc()
        }, 99)

        this.worker.onmessage=({data})=>{
            clearTimeout(promise)
            localStorage.setItem('', json)
            console.log(data)
            this.setState({errs:data[0], vals:data[1]})
        }

        this.worker.postMessage(sheet)
    }

    debouncedCalc = this.debounce(this.calc, 100)

    hangleInputChangeWrapper = (name)=>{
         return (event)=>{
             const {sheet} = this.state
             let nextSheet = {...sheet}
             nextSheet[name] = event.target.value
             this.setState({sheet:nextSheet})
             this.debouncedCalc()
        }
    }

    handleKeyDownWrapper = (row, col)=>{
        return (evt)=>{
            if(evt.key==='Enter'||evt.key==='ArrowDown'){
                let cell = document.getElementById(col+''+(row+1))
                if(cell) cell.focus()
            }else if(evt.key==='ArrowUp'){
                let cell = document.getElementById(col+''+(row-1))
                if(cell) cell.focus()
            }
        }

    }


    render(){
        const {row, col, errs, vals, sheet} = this.state
        return (
            <div>
                <div></div>
                <table>
                    <thead>
                    <tr>
                        <th>
                            <button onClick={this.reset}>↻</button>
                        </th>
                        {col.map(c=>(<th key={c}>{c}</th>))}
                    </tr>
                    </thead>
                    <tbody>
                        {row.map((r)=>{
                            return (
                            <tr key={r}>
                                <th>{r}</th>
                                {col.map((c)=>{
                                    let name = c+''+r
                                    let value = sheet[name]||''
                                    return(<td key={c} className={value[0]==='='?'formula' : undefined}>
                                        <input id={name} onChange={this.hangleInputChangeWrapper(name)} value={value} onKeyDown={this.handleKeyDownWrapper(r, c)}/>
                                        <div className={errs[name]?'error':(vals[name]&&vals[name][0])?'text':undefined}>{errs[name]||vals[name]}</div>
                                    </td>)
                                })}
                            </tr>)
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default SpreadSheet;
