import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// namedImportのrouterをindexRouterとしてimport
import { router as indexRouter } from "./routes/index";
import { router as manageStockRouter } from "./routes/manage-stock";

const app = express();

// view engine setup
app.set('views', path.join('views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join('public')));

app.use('/', indexRouter);
app.use('/products', manageStockRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 下のerrに対応する宣言型がないためinterface ErrorWithStatus を追加
interface ErrorWithStatus extends Error {
  status: number;
}

// error handler
app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
