
import { Typography } from "@mui/material";
import Markdown from "react-markdown";
import {Link} from "react-router-dom";

export default function CustomMarkdown({children}) {

    const components = {
        a(props) {
            const {node, href, ...rest} = props;
            if (href.startsWith("http://")) {
                return <a href={href} {...rest}/>;
            } else {
                return <Link to={href} {...rest} />
            }
        },
        p(props) {
            const {node, ...rest} = props;
            return <Typography variant='body' component='p' sx={{ marginBottom: '5px'}} {...rest}/>
        },
        h1(props) {
            const {node, ...rest} = props;
            return <Typography variant='h4' {...rest}/>
        },
        h2(props) {
            const {node, ...rest} = props;
            return <Typography variant='h5' {...rest}/>
        },
        h3(props) {
            const {node, ...rest} = props;
            return <Typography variant='h6' {...rest}/>
        },
        h4(props) {
            const {node, ...rest} = props;
            return <Typography variant='subtitle1' {...rest}/>
        },
        h5(props) {
            const {node, ...rest} = props;
            return <Typography variant='subtitle2' {...rest}/>
        },
        h6(props) {
            const {node, ...rest} = props;
            return <Typography variant='subtitle2' {...rest}/>
        },
    };

    return <Markdown components={components}>{children}</Markdown>
}