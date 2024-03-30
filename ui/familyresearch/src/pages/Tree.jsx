import { getTree } from "../backend";
import {  useLoaderData, Link } from 'react-router-dom';
import Box from '@mui/material/Box';

const treeParams = {
    root: "65d764b07b2ae549be7a6888",
    nodeWidth: 80,
    nodeHeight: 50,
    siblingDistance: 10,
    subtreeDistance: 40,
    generationDistance: 50
};

export default function TreePage() {
    const [people, lines] = useLoaderData();


    const boxSize = {
        position: "absolute",
        width: treeParams.nodeWidth,
        height: treeParams.nodeHeight,
        borderStyle: 'solid',
        overflow: 'hidden'
    };

    const width = Math.max(...lines.map(line=>line[2])) + treeParams.nodeWidth;
    const height = Math.max(...lines.map(line=>line[3])) + treeParams.nodeHeight;


    return (
        <>
        <div> 
        <div style={{position: 'absolute', top: 0, left: 0, width:`${width}px`, height: `${height}px`}}>
            <svg width="100%" height="100%">
            {
                lines.map((line, i) => {
                    return <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} stroke="purple"  strokeWidth="3" />;
                })  
            }
        </svg>

            {
                Object.values(people).map(person => 
                <Box key={person.personId} sx={{...boxSize, left: person.x, top:person.y}}>
                    <Link to={`/people/${person.personId}`} style={{color: "black", textDecoration: "none"}}>{person.name.first}<br/>
                    {person.name.last}</Link>
                </Box>)
            }
            
            </div>
        </div>
                

        </>
    );
}


export async function loader({ request, params }) {
    const people = {};
    (await getTree(treeParams)).forEach(person => 
        {
            people[person.personId] = person;
        })

    const lines = [];
    const xs = [];

    Object.values(people).forEach(person => {
        if (person.children.length === 1) {
            const x = person.x + treeParams.nodeWidth / 2;
            const y1 = person.y + treeParams.nodeHeight;
            const y2 = y1 + treeParams.generationDistance;
            lines.push([x, y1, x, y2]);
        }
        else if (person.children.length > 1) {
            // line down from person to mid-y 
            const x = person.x + treeParams.nodeWidth / 2;
            const y1 = person.y + treeParams.nodeHeight;
            const y2 = y1 + treeParams.generationDistance / 2;
            lines.push([x, y1, x, y2]);

            // horizontal line from middle of leftmost child to middle of rightmost child 
            const leftMostChild = people[person.children[0]];
            const rightMostChild = people[person.children[person.children.length-1]];
            const x2 = leftMostChild.x + treeParams.nodeWidth / 2;
            const x3 = rightMostChild.x + treeParams.nodeWidth / 2;
            lines.push([x2, y2, x3, y2]);

            person.children.forEach(childId => {
                const child = people[childId];
                const x4 = child.x + treeParams.nodeWidth / 2;
                const y3 = child.y;
                lines.push([x4, y2, x4, y3]);
            })


        }

    });

  

    return [people, lines];
 }