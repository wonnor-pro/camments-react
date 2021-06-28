import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar as faStarS} from '@fortawesome/free-solid-svg-icons';
import {withFirebase} from "../../Firebase";
import {Link} from "react-router-dom";
import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {withStyles} from "@material-ui/core/styles";
import Rating from "@material-ui/lab/Rating";

const StyledRating = withStyles({
  iconFilled: {
    color: '#FA9600',
  },
  iconHover: {
    color: '#FA9600',
  },
})(Rating);

class MobileReviews extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dispSwitch: {},  // for the OnMouse switch func
      division: [],   // list of divisions
      coursesList: {},   // {key: division, value: [courseIds]}
      isFetching: false,
      userDivision: ""
    };

    this.openModule = this.openModule.bind(this);
    this.readModule = this.readModule.bind(this);
    this.fetchPostsAsync = this.fetchPostsAsync.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async fetchPostsAsync() {
    try {
      this.setState({...this.state, isFetching: true});
      const querySnapshot = await this.readModule();

      let division = [];
      let coursesList = {};
      let dispSwitch = {};

      querySnapshot.forEach((doc) => {
        const id = doc.get("course_id");
        const new_division = id.slice(0, 2);

        // add new pair to courses list if not yet
        if (!(new_division in coursesList)) {
          coursesList[new_division] = [];
          dispSwitch[new_division] = "none";
          division.push(new_division);
        }
        coursesList[new_division].push(doc.data());
      });

      this.setState({
        ...this.state,
        dispSwitch: dispSwitch,
        division: division,
        coursesList: coursesList,
        isFetching: false
      });
    } catch (e) {
      console.log(e);
      this.setState({...this.state, isFetching: false});
    }
  };

  async readModule() {
    // read through all the documents in courses collection
    const coursesRef = this.props.firebase.fs.collection("courses");
    return coursesRef.where("course_id", ">=", "3A").get()
  }

  openModule(courseName) {
    // Declare all variables
    let newSwitch = this.state.dispSwitch;
    for (const [key,] of Object.entries(this.state.dispSwitch)) {
      newSwitch[key] = "none";
    }
    newSwitch[courseName] = "block";
    this.setState({...this.state, userDivision: courseName, dispSwitch: newSwitch});

    this.forceUpdate();
  }

  componentDidMount() {
    const fetchPosts = this.fetchPostsAsync;
    fetchPosts();

  }

  handleChange(event){
    this.openModule(event.target.value);
  };

  render() {
    return (
      <div className="mobile-main">
        <div className="mobile-division">
          <p>Select the course division</p>
          <FormControl variant="outlined" style={{minWidth: 250}}>
            <InputLabel id="demo-simple-select-outlined-label">Part IIA</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.userDivision}
              autoWidth={false}
              onChange={this.handleChange}
              label="division"
            >
              {this.state.division.map((value, index) => {
                return (
                  <MenuItem className="mobile-tabs" key={index} id={value} value={value}>{value}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </div>
        {this.state.division.map((value, index) => {
          return (
            <div id={value} key={index} className="mobile-tabcontent" style={{display: this.state.dispSwitch[value]}}>
              <div id="mobile-post-lists">
                {this.state.coursesList[value].map((course, index) => {
                  return (
                    <div className="mobile-post-record" key={index}>
                      <p className="mobile-posts-course-id">{course.course_id}</p>
                      <p className="mobile-posts-review-counts">{course.num_posts} Reviews</p>
                      <div className="mobile-posts-score_wrapper">
                        <StyledRating
                          name="score"
                          value={course.score}
                          icon={<FontAwesomeIcon icon={faStarS}/>}
                          precision={0.5}
                          size="small"
                          readOnly
                        />
                      </div>
                      <Link to={"/Post/" + course.course_id}
                            className="mobile-posts-course-title">{course.name}</Link>
                    </div>
                  )
                })}

              </div>
            </div>
          )
        })}
      </div>
    );
  }

}

export default withFirebase(MobileReviews);