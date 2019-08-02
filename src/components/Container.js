import React from 'react'
import Story from './Story'
import ProgressArray from './ProgressArray'
import PropTypes from 'prop-types'

class Container extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currentStoryGroup: 0,
      currentStoryItem: 0,
      pause: true,
      count: 0,
      storiesDone: 0
    }
    this.defaultInterval = props.defaultInterval
    this.width = props.width
    this.height = props.height
  }

  pause = (action, bufferAction) => {
    this.setState({ pause: action === 'pause', bufferAction })
  }

  previous = () => {
    if (this.state.currentStoryItem > 0) {
      this.setState({
        currentStoryItem: this.state.currentStoryItem - 1,
        count: 0
      })
    } else {
      this.updatePreviousStoryGroup()
    }
  }

  next = () => {
    if (this.state.currentStoryItem < this.props.stories[this.state.currentStoryGroup].items.length - 1) {
      this.setState({
        currentStoryItem: this.state.currentStoryItem + 1,
        count: 0
      })
    } else if (this.props.loop) {
      this.updateNextStoryGroupForLoop()
    } else {
      this.updateNextStoryGroup()
    }
  }

  updatePreviousStoryGroup = () => {
    if (this.state.currentStoryGroup > 0) {
      this.setState({
        currentStoryGroup: this.state.currentStoryGroup - 1,
        currentStoryItem: this.props.stories[this.state.currentStoryGroup - 1].items.length - 1,
        count: 0
      })
    }
  }

  updateNextStoryGroup = () => {
    if (this.state.currentStoryGroup < this.props.stories.length - 1) {
      this.setState({
        currentStoryGroup: this.state.currentStoryGroup + 1,
        currentStoryItem: 0,
        count: 0
      })
    }
  }

  updateNextStoryGroupForLoop = () => {
    this.setState({
      currentStoryGroup: (this.state.currentStoryGroup + 1) % this.props.stories.length,
      currentStoryItem: 0,
      count: 0
    })
  }

  mouveDown = (e) => {
    // Save reference to starting x position
    this.mouseDownXPos = e.touches[0].clientX,

    // Debounce pause
    e.preventDefault()
    this.mousedownId = setTimeout(() => {
      this.pause('pause')
    }, 200)
  }

  mouseUp = (e, type) => {
    e.preventDefault()
    this.mousedownId && clearTimeout(this.mousedownId)

    const diff = this.mouseDownXPos ? this.mouseDownXPos - e.touches[0].clientX : 0

    // Threshold for a swipe
    if (Math.abs(diff) > 100) {
      if (diff > 0) { // swipe left
        if (this.props.loop) {
          this.updateNextStoryGroupForLoop()
        } else {
          this.updateNextStoryGroup()
        }
      } else { // swipe right
        this.updatePreviousStoryGroup()
      }
    
      this.mouseDownXPos = null      
    } else if (this.state.pause) {
      this.pause('play')
    } else {
      type === 'next' ? this.next() : this.previous()
    }
  }

  getVideoDuration = duration => {
    this.setState({ videoDuration: duration })
  }

  toggleMore = show => {
    if (this.story) {
      this.story.toggleMore(show)
      return true
    } else return false
  }

  render() {
    const { currentStoryGroup, currentStoryItem } = this.state

    return (
      <div style={{ ...styles.container, ...{ width: this.width, height: this.height } }}>
        <ProgressArray
          next={this.next}
          pause={this.state.pause}
          bufferAction={this.state.bufferAction}
          videoDuration={this.state.videoDuration}
          length={this.props.stories[currentStoryGroup].items.map((_, i) => i)}
          defaultInterval={this.defaultInterval}
          currentStory={this.props.stories[currentStoryGroup].items[currentStoryItem]}
          progress={{ id: currentStoryItem, completed: this.state.count / ((this.props.stories[currentStoryGroup].items[currentStoryItem] && this.props.stories[currentStoryGroup].items[currentStoryItem].duration) || this.defaultInterval) }}
        />
        <Story
          ref={s => this.story = s}
          action={this.pause}
          bufferAction={this.state.bufferAction}
          height={this.height}
          playState={this.state.pause}
          width={this.width}
          story={this.props.stories[currentStoryGroup].items[currentStoryItem]}
          loader={this.props.loader}
          header={this.props.header}
          headerContent={this.props.stories[currentStoryGroup].headerContent}
          getVideoDuration={this.getVideoDuration}
          storyContentStyles={this.props.storyContentStyles}
        />
        <div style={styles.overlay}>
          <div style={{ width: '50%', zIndex: 999 }} onTouchStart={this.mouseDown} onTouchEnd={e => this.mouseUp(e, 'previous')} onMouseDown={this.mouseDown} onMouseUp={(e) => this.mouseUp(e, 'previous')} />
          <div style={{ width: '50%', zIndex: 999 }} onTouchStart={this.mouseDown} onTouchEnd={e => this.mouseUp(e, 'next')} onMouseDown={this.mouseDown} onMouseUp={(e) => this.mouseUp(e, 'next')} />
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    background: '#111',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    height: 'inherit',
    width: 'inherit',
    display: 'flex'
  },
  left: {
  },
  right: {
  }
}

Container.propTypes = {
  stories: PropTypes.array,
  defaultInterval: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  loader: PropTypes.element,
  header: PropTypes.element,
  storyContentStyles: PropTypes.object,
  loop: PropTypes.bool
}

Container.defaultProps = {
  defaultInterval: 4000,
  width: 360,
  height: 640
}

export default Container
