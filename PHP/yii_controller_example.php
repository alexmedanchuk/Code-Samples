<?php

class SiteController extends Controller
{
    public $message="";
    public function actions()
    {
        return array(
            'index' => array(
                'class' => 'SiteController',
                'view' => 'index'
            ),
            'captcha'=>array(
                'class'=>'CCaptchaAction',
                'backColor'=>0xFFFFFF,
            ),
            'page'=>array(
                'class'=>'CViewAction',
                'view'=>'message'
            ),
        );
    }
    public function actionError()
    /* Handle errors. */
    {
        if($error=Yii::app()->errorHandler->error)
        {
            if(Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }

    public function actionIndex()
    /* Default action of controller. */
    {
        $model=new User();
        $user_id=Yii::app()->user->id;
        if(!isset($user_id) && isset($_POST['User']))
        {
            if(isset($_POST['User']))
            {
                $model->attributes=$_POST['User'];
                if($model->login())
                {
                    $this->redirect('/');
                }
                else
                {
                    $this->render("login",array("model"=>$model,"errors"=>$model->getErrors()));
                }
            }
            else
                $this->render("login",array("model"=>$model,"errors"=>$model->getErrors()));
        }
        elseif(isset(Yii::app()->user->id)) {
            $model = User::model()->findByPk(Yii::app()->user->id);
            $this->render('index',array("model"=>$model));
        }

        else $this->render("login",array("model"=>$model,"errors"=>$model->getErrors()));
    }


    public function actionMessages()
    /* Get messages from friends. */
    {
        if(isset(Yii::app()->user->id))
            $message = Message::model();
            $this->render('messages',array("friends"=>$message->messageStructure($message->getAllFriendsMessages(Yii::app()->user->id))));
        else $this->redirect('/');
    }

    public function actionAdmin()
    /* Admin page. */
    {
        $this->layout="//layouts/column3";
        if(isset(Yii::app()->user->id))
        {
            if(User::model()->isAdmin(Yii::app()->user->id))
                $this->render('admin');
        }
        else $this->redirect('/');

    }
    public function actionLogin()
    /* Login user to server. */
    {
        if(!isset(Yii::app()->user->id) || isset($_POST['User']))
        {
            $model=new User();
            if(isset($_POST['User']))
            {
                $model->attributes=$_POST['User'];
                if($model->login())
                {
                    $model=User::model()->findByAttributes(array('email'=>trim(strtolower($model->email))));
                }
                else
                    $this->renderPartial('login',array("model"=>$model));
            }
            else
                $this->renderPartial('login',array("model"=>$model));
        }
        else
            $this->renderPartial("login",array("model"=>new User()));
    }

    public function actionLogout()
    /* Logout user from server. */
    {
        Yii::app()->user->logout();
        $this->redirect("/");
    }

    public function actionAllUserByCompany()
    /* Display company users. */
    {
        if(isset($_POST['Usergroup']['company']))
        {
            $html=$this->renderPartial("user-by-company",
                array("group"=>Usergroup::model()->findByPk($_POST['Usergroup']['id']),
                    "model"=>User::model()->getAllUsersByCompany($_POST['Usergroup']['company'])),
                true);
            if(isset($_POST['Usergroup']) && !empty($_POST['Usergroup']) && isset($_POST['Usergroup']['company']) && !empty($_POST['Usergroup']['company']))
                echo json_encode(array("error"=>false,"message"=>"","html"=>$html));
            else echo json_encode(array("error"=>true,"message"=>"","html"=>$html));
        }
        else
        {
            $this->redirect("/");
        }
    }

    public function actionLike()
    /* Add/remove like to comment. */
    {
        if(isset($_POST) && !empty($_POST['Comments']))
        {
            $like_search=Likes::model()->findByAttributes(array('user_id'=>Yii::app()->user->id,'comments_id'=>$_POST['Comments']['id']));
            if($like_search)
            {
                if($like_search->like==Likes::NOT_LIKE)
                {
                    $like_search->like=Likes::LIKE;
                }
                else $like_search->like=Likes::NOT_LIKE;
                $like_search->save();
            }
            else
            {
                $like=new Likes();
                $like->comments_id=$_POST['Comments']['id'];
                $like->user_id=Yii::app()->user->id;
                $like->like=Likes::LIKE;
                $like->save();
            }
        }
        echo json_encode(array('error'=>false,'message'=>count(Likes::model()->findByAttributes(
            array('like'=>Likes::LIKE,'user_id'=>Yii::app()->user->id,'comments_id'=>$_POST['Comments']['id'])))));
    }

    public function actionGetFriendRequestsCount()
    /* Count requests for friendship. */
    {
        echo json_encode(array("error"=>False,"count"=>Friendship::model()->countFriendRequests(Yii::app()->user->id)));
    }
}
