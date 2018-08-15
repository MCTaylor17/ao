import utils from './utils'
import validators from './validators'
import events from '../events'
import state from '../state'
import { calculateTaskPayout } from '../../calculations'

module.exports = function(req,res, next){
  switch (req.body.type){
      case 'task-created':
           specTaskCreated(req, res, next)
           break
      case 'task-claimed':
          specTaskClaimed(req, res, next)
          break
      case 'task-boosted':
          specTaskBoosted(req, res, next)
          break
      case 'task-rate-updated':
          specTaskRateUpdated(req, res, next)
          break
      case 'task-cap-updated':
          specTaskCapUpdated(req, res, next)
          break
      case 'task-instructions-updated':
          specTaskInstructionsUpdated(req, res, next)
          break
      case 'task-removed':
          specTaskRemoved(req, res, next)
          break
      default:
          next()
  }
}
//
function specTaskCreated(req, res, next){
  let errRes = []
  if (
    validators.isName(req.body.name, errRes) &&
    validators.isNotes(req.body.description, errRes) &&
    validators.isAmount(req.body.monthlyValue, errRes) &&
    validators.isAmount(req.body.boost, errRes) &&
    validators.isAmount(req.body.cap, errRes) &&
    validators.isBool(req.body.oneTime, errRes) &&
    validators.isFob(req.body.fob, errRes)
  ){
    events.tasksEvs.taskCreated(
      req.body.name,
      req.body.description,
      req.body.monthlyValue,
      req.body.cap,
      req.body.boost,
      req.body.fob,
      req.body.oneTime,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskClaimed(req, res, next){
  let errRes = []
  // TODO: this member-fob conversion in earlier middleware, (new name authFob?)
  let paid
  state.pubState.tasks.forEach( task => {
    if (task.taskId == req.body.taskId){
        paid = calculateTaskPayout(task)
    }
  })
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(paid, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.tasksEvs.taskClaimed(
      req.body.taskId,
      req.body.memberId,
      paid,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
      res.status(400).send(errRes)
  }
}

function specTaskCapUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isAmount(req.body.amount, errRes)
  ){
    events.tasksEvs.taskCapUpdated(
      req.body.taskId,
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskRateUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isAmount(req.body.amount, errRes)
  ){
    events.tasksEvs.taskRateUpdated(
      req.body.taskId,
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}


function specTaskInstructionsUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isNotes(req.body.newInstructions, errRes)
  ){
    events.tasksEvs.taskInstructionsUpdated(
      req.body.taskId,
      req.body.newInstructions,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskBoosted(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isAmount(req.body.amount, errRes)
  ){
    events.tasksEvs.taskBoosted(
      req.body.taskId,
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}


function specTaskRemoved(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes)
  ){
    events.tasksEvs.taskRemoved(
      req.body.taskId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}
