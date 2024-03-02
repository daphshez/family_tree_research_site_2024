
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonMultiselectDetail from "./PersonMultiselectDetail"


export default function PersonBooleanDetail({detailId, title, defaultFieldValue, makeUpdate, applyUpdate}) {
  return PersonMultiselectDetail({
    detailId,
    title,
    defaultFieldValue,
    makeUpdate,
    applyUpdate,
    choices: {
      'yes': <CheckIcon />,
      'no':  <CloseIcon />
    }

  })

}