

export default  function MenuItem({ title, onSelect, isSelected })
{
    return (
        <li className="nav-item"><button className={isSelected ? 'active nav-link' : 'nav-link'}  
                                     id={title} 
                                     onClick={onSelect}>{title}</button></li>
    )
}