
import Markdown from "react-markdown";
import {Link} from "react-router-dom";

export default function RouterMarkdown({children}) {

    const components = {
        a(props) {
            const {node, href, ...rest} = props;
            if (href.startsWith("http://")) {
                return <a href={href} {...rest}/>;
            } else {
                return <Link to={href} {...rest} />
            }
        }
    };

    return <Markdown components={components}>{children}</Markdown>
}