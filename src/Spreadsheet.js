import React from 'react';
import './Spreadsheet.css';
import worker_script from './worker'

class SpreadSheet extends React.Component{
    constructor(props){
        super(props)
        let col = Array.from({length:8}).map((a,i)=>String.fromCharCode('A'.charCodeAt(0)+i))
        let row = Array.from({length:20}).map((a,i)=>i+1)
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

    reset = ()=>{
        let col = Array.from({length:8}).map((a,i)=>String.fromCharCode('A'.charCodeAt(0)+i))
        let row = Array.from({length:20}).map((a,i)=>i+1)
        this.setState({
            col,
            row,
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

    calc=this.debounce(()=>{
        console.log('hello world')
        console.log('calc')
        const {sheet} = this.state
        const json = JSON.stringify(sheet)
        const promise = setTimeout(()=>{
            this.worker.terminate()
            let sheet = localStorage.getItem('')
            if(!sheet) this.reset()
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
    }, 99)

    hangleInputChangeWrapper = (name)=>{
         return (event)=>{
             const {sheet} = this.state
             let nextSheet = {...sheet}
             nextSheet[name] = event.target.value
             this.setState({sheet:nextSheet})
             this.calc()
        }
    }

    handleKeyDownWrapper = (row, col)=>{
        return (evt)=>{
            console.log(evt.key)
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
                                <div className={value[0]?'text':undefined}>{errs[name]||vals[name]}</div>
                            </td>)
                        })}
                    </tr>)
                })}
            </tbody>
        </table>
        )
    }
}

export default SpreadSheet;
