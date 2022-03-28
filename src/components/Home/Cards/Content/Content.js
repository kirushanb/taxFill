import React from 'react'
import './Content.scss'


const Content = (props) => {
  return (
    <div className='content-wrapper'>
 <div className='cards-grid'>
    {props.list.map(n=>
        <div key={n.name} className='single-card'>
            <span className="icon is-large">
            <i className="fas fa-lg fa-home"></i>
            </span>
            <div className='sigle-card-content'> 
                <p className="title is-4">{n.name}</p>
                <p className="title is-4">{"£" + n.price}</p>
                <div className="list">
                {n.tags.split(',').map((l) => (
                    <span key={l} className="icon-text">
                    <span className="icon is-large">
                        <i className="fas fa-arrow-right"></i>
                    </span>
                    <p className="subtitle is-6">{l}</p>
                    </span>
                ))}
            </div>
            </div>
                
           
        </div>
        )}
        
</div>
    </div>
  
  )
}

export default Content