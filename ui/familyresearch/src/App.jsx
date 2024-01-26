import { useState } from 'react'

import MenuItem from './components/MenuItem';
import PeopleSection from './components/PeopleSection';
import ProjectsSection from './components/ProjectsSection';

function App() {

  const [selectedTopic, setSelectedTopic] = useState("People");

  function handleMenuSelect(selectedTitle) {
    setSelectedTopic(selectedTitle);
  }

  let sectionContent = <PeopleSection/>;
  if (selectedTopic == 'Projects')
    sectionContent = <ProjectsSection/>;
  

  return (
    <>
      <header>Family Research</header>

      <main id="main-menu">
        <menu className="nav nav-pills">
          <MenuItem title="People" onSelect={() => handleMenuSelect("People")} isSelected={selectedTopic === "People"}/>
          <MenuItem title="Projects"  onSelect={() => handleMenuSelect("Projects")}  isSelected={selectedTopic === "Projects"}/>
        </menu>

        <section id="tab-content">
            {sectionContent}
        </section>
      </main>
    </>
  )
}

export default App
